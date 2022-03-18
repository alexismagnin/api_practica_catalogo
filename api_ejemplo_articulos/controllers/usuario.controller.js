const db = require("../models")
const crypto = require('crypto');
const Rol = db.rol
const Usuario = db.usuario

exports.getAll = (req, res) => {
    let jsonUsuarios = []
    let usuarios = []
    Usuario.findAll({
        attributes: ["cuenta", "nombre", "rol_id"]
    })
        .then( result => {
            usuarios = result
            Rol.findAll(
                {attributes: ["id", ["rol", "nombre"]]},
                {where: {id: result.rol_id}} )
            .then( roles => {
                usuarios.forEach( u => { 
                    let usuario = {}
                    let rolesUsuario = []
                    let encontrado = false
                    let i = 0
                    usuario.cuenta = u.cuenta
                    usuario.nombre = u.nombre
                    while (!encontrado && i<roles.length) {
                        if (roles[i].id == u.rol_id) {
                            rolesUsuario.push(roles[i])
                            encontrado = true
                        }
                        i++
                    }
                    usuario.roles = rolesUsuario
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

exports.getUserRoles = (req, res) => {
    Usuario.findOne({ where: {id: req.params.id }})
    .then( usuario => {
        if (usuario) {
            let roles = []
            Rol.findOne(
                {attributes: ["id", ["rol", "nombre"]]},
                {where: {id: usuario.rol_id}}
            ).then( rol => {
                if (rol) roles.push(rol)
                res.status(200).send(roles)
            }) 
        }
        else {
            throw { status: 404, message: "No se encontró usuario id="+req.params.id}
        }
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
        await verificarRoles(req.body.roles)
        // Si no hay pass o si está vacía, se genera una automáticamente
        {   let md5_pass
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
            rol_id: req.body.roles[0]
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
            if (req.body.roles){
                await verificarRoles(req.body.roles)
                cambios.rol_id = req.body.roles[0]
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

async function verificarRoles(arrayRoles){
    let idRoles_ok = true
    //verificación de id correctos de roles
    try{
        //Verifico que los datos pasados sean correctos
        if (Array.isArray(arrayRoles)){
            //Traigo todos los id de las roles
            await Rol.findAll().then( roles => {
                //Comparo los id pasados con los id de roles existentes
                arrayRoles.forEach( r => {
                    idRoles_ok = false
                    for (i=0; (i < roles.length && !idRoles_ok); i++){
                        if (roles[i].id == r){
                            idRoles_ok = true
                        }
                    }
                    //Si el id chequeado no se encuentra entre los existentes, se lanza error
                    if (!idRoles_ok) {
                        throw {status: 404, message: "No se encontró rol id="+r}
                    }
                })
            })
            //Si llega hasta acá es porque todos los ids son correctos
            return idRoles_ok
        } else {
            throw {status: 400, message: "Formato no válido en los id de roles"}
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