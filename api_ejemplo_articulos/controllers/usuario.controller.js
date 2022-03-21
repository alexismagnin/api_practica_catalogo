const db = require("../models")
const crypto = require('crypto');
const Rol = db.rol
const Usuario = db.usuario

exports.getAll = (req, res) => {
    let jsonUsuarios = []
    let usuarios = []
    Usuario.findAll({
        attributes: ["id", "cuenta", "nombre", "rol_id"] //no se pedía devolver id, pero yo lo agregué
    })
        .then( result => {
            usuarios = result
            Rol.findAll(
                {attributes: ["id", ["rol", "nombre"]]} )
            .then( roles => {
                usuarios.forEach( u => { 
                    let usuario = {}
                    let encontrado = false
                    let i = 0
                    usuario.id = u.id //no se pedía, pero yo lo agregué
                    usuario.cuenta = u.cuenta
                    usuario.nombre = u.nombre
                    while (!encontrado && i<roles.length) {
                        if (roles[i].id == u.rol_id) {
                            usuario.rol = roles[i]
                            encontrado = true
                        }
                        i++
                    }
                    jsonUsuarios.push(usuario)
                 })
                return res.status(200).send(jsonUsuarios)
            })
        })
        .catch( error => {
            if (error.status == null ) error.status = 500
            return res.status(error.status).send(error.message)
        })
}

exports.add = async (req, res) => {
    try{
        // verificación de email
        if (!verificarEmail(req.body.cuenta)) {
            throw {status: 400, message: "Formato de email no válido"}
        }
        //verificación de id correctos de roles
        await verificarRol(req.body.rol_id)
        // Si no hay pass o si está vacía, se genera una automáticamente
        let md5_pass
        {   
            if (req.body.pass && req.body.pass != ""){
                md5_pass = crypto.createHash('md5').update(req.body.pass).digest('hex');
            } else {
                md5_pass = crypto.createHash('md5').update(generarPass(req.body.cuenta)).digest('hex');
            }
        }
        await Usuario.create({
            cuenta: req.body.cuenta,
            nombre: req.body.nombre,
            pass: md5_pass,
            rol_id: req.body.rol_id
        }).then( usuario =>{
            res.status(200).send(usuario.nombre+" fue creado con éxito (id= "+usuario.id+")")
        })

    } catch(error){
        if (error.status == null ) error.status = 500
        return res.status(error.status).send(error.message)
    }
}

exports.update = async (req, res) => {
    try{
        await Usuario.findOne({ where: {id: req.params.id}})
        .then(async usuario => {
            if (!usuario) throw {status: 404, message: "No se encontró usuario con id=" + req.params.id}
            let cambios = {}
            // verificación de email
            if (req.body.cuenta)
                if (verificarEmail(req.body.cuenta)) cambios.cuenta = req.body.cuenta
                else throw {status: 400, message: "Formato de email no válido"}
            //verificación de id correctos de roles
            if (req.body.rol_id){
                await verificarRol(req.body.rol_id)
                cambios.rol_id = req.body.rol_id
            }
            //verificacion de cambio de nombre
            if (req.body.nombre) cambios.nombre = req.body.nombre
            //verificación de pass nueva
            if (req.body.pass){
                if (req.body.pass != "")
                    cambios.pass = crypto.createHash('md5').update(req.body.pass).digest('hex')
                else throw {status: 400, message: "Formato erróneo de contraseña"}
            }
            await Usuario.update(cambios,
                    { where: {id: usuario.id }}
                ).then( () => {
                res.status(200).send("Usuario id=" + usuario.id + " fue modificado con éxito")
            })          
        })
    } catch(error){
        if (error.status == null ) error.status = 500
        return res.status(error.status).send(error.message)
    }
}

exports.delete = async (req, res) => {
    try {
        await Usuario.findOne({ where: {id: req.params.id}})
        .then( async usuario => {
            if (usuario != null) {
                await Usuario.destroy({ where: {id: req.params.id}})
                .then( num => {
                    return res.status(200).send("Se borraron "+ num +" registros")
                })
            } else {
                throw {status:404, message: "No se encontró usuario id="+req.params.id}
            }
        })
    } catch (error) {
        if (error.status == null ) error.status = 500
        return res.status(error.status).send(error.message)
    }
}

function verificarEmail(email){
    let isOk = false
    let e = new String(email)
    if (e.endsWith(".com")){
        let match = e.match(/@/g)
        if (match && match.length == 1){
            let indexOf = e.indexOf("@")
            if (indexOf > 0 && e.substring(indexOf+1,e.length - 4)) {
                isOk = true
            }
        }
    }
    return isOk
}

async function verificarRol(rol_id){
    let idRol_ok = true
    //verificación de id correctos de roles
    try{
        //Verifico que los datos pasados sean correctos
        if (Number.isInteger(rol_id)){
            //Busco el rol, si el resultado no es nulo, se verifica que el id pertenece a un rol
            await Rol.findOne({ where: {id: rol_id}})
            .then( rol => {
                if (rol != null) idRol_ok = true
                //Si rol es null, el id chequeado no se encuentra entre los existentes y se lanza error
                else throw {status: 404, message: "No se encontró rol id="+rol_id}
                })
            //Si llega hasta acá es porque todos los ids son correctos
            return idRol_ok
        } else {
            throw {status: 400, message: "Formato no válido de id"}
        }
    } catch (error) {
        if (error.status == null ) error.status = 500
        throw error
    }
}

function generarPass(email){
    let pass = new String(email)
    pass = pass.substring(0, pass.indexOf("@")) + Date.now()
    return pass
}