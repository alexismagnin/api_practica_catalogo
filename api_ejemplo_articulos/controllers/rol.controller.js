const db = require("../models")
const sequelize = db.sequelize
const Rol = db.rol
const Politica = db.politica
const Rol_politica = db.rol_politica

exports.getAll = (req, res) => {
    Rol.findAll({
        attributes: ["id", ["rol","nombre"]]
    })
        .then( result => {
            return res.status(200).send(result)
        })
        .catch( error => {
            return res.status(500).send(error.message)
        })
}

exports.delete = (req, res) => {
    Rol.findOne({
        where: { id: req.params.id }
    })
        .then ( rol => {
            if (rol !== null) {
                Rol.destroy({
                    where: { id: req.params.id }
                })
                    .then( num => {
                        return res.status(200).send("Se borraron "+ num +" registros")
                    })
            } else {
                throw {status: 404, message: "No se encontró el id del registro a borrar"}
            }
        })
        .catch( error => {
            if (error.status == null ) error.status = 500
            return res.status(error.status).send(error.message)
        })
}

exports.add = async (req, res) => {
    let idPoliticas_ok = true
    let rolCreado = new Rol
    try{
        //verificación de id correctos de politicas
        if (req.body.politicas) {
            idPoliticas_ok = await verificarPoliticas(req.body.politicas)
        }
        sequelize.transaction( transaction => {
            let rolPromise = Rol.create({
            rol: req.body.nombre
            }, {transaction})
                .then( newRol => {
                    rolCreado = newRol
                })

            //Alternativa a Promise.all ya que se espera una sola promesa cuando se crea el nuevo rol
            return Promise.resolve(rolPromise).then( () => {
                let rpPromises = []
                //Si se indicaron politicas asociadas y se verificaron bien los id, se crean las asociaciones en roles_politicas
                if (req.body.politicas && idPoliticas_ok){
                    req.body.politicas.forEach( p => {
                        rpPromises.push(
                            Rol_politica.create({
                            rol_id: rolCreado.id,
                            politica_id: p
                            }, {transaction})
                        )
                    })
                    return Promise.all(rpPromises)
                }
            })
        })
            .then( () => {
                //auto commit
                return res.status(201).send("Rol \""+rolCreado.rol+"\" (id="+rolCreado.id+") fue creado, con sus políticas asociadas")
            })
            .catch( (error) => {
                // auto rollback
                if (error.status == null ) error.status = 500
                return res.status(error.status).send(error.message)
            })
    } catch(error){
        if (error.status == null ) error.status = 500
        return res.status(error.status).send(error.message)
    }
}

exports.update = async (req, res) => {
    let idPoliticas_ok = true
    //verificación de id correctos de politicas
    try{
        if (req.body.politicas){
            idPoliticas_ok = await verificarPoliticas(req.body.politicas)
        }

        Rol.findOne({
            where: { id: req.params.id }
        })
            .then( r => {
                if (r !== null) {                
                    sequelize.transaction( transaction =>{
                        let promises = []
                        if (req.body.nombre){
                            promises.push(Rol.update(
                                { rol: req.body.nombre },
                                { where: { id: req.params.id }, transaction}
                            ))
                        }
                        if (req.body.politicas && idPoliticas_ok){
                            promises.push(Rol_politica.destroy({ where: { rol_id: req.params.id }, transaction}))
                        }
                        return Promise.all(promises).then( () => {
                            let polPromises = []
                            if (Array.isArray(req.body.politicas) && idPoliticas_ok){
                                req.body.politicas.forEach( p=>{
                                    polPromises.push(Rol_politica.create({
                                        rol_id: req.params.id,
                                        politica_id: p
                                        }, {transaction}))
                                })    
                            }
                            return Promise.all(polPromises)
                        })
                    })
                    .then( ()=>{
                        // auto commit
                        return res.status(200).send("Rol id="+req.params.id+" modificado con éxito")
                    })
                    .catch( error => {
                        //auto rollback
                        if (error.status == null ) error.status = 304
                        return res.status(error.status).send(error.message)
                    })
                } else {
                    throw {status: 404, message: "No se encontró el rol indicado (id="+req.params.id+")"}
                }
            })
    }
    catch(error){
        if (error.status == null ) error.status = 500
        return res.status(error.status).send(error.message)
    }
}

async function verificarPoliticas(arrayPoliticas){
    let idPoliticas_ok = true
    //verificación de id correctos de politicas
    try{
        //Verifico que los datos pasados sean correctos
        if (Array.isArray(arrayPoliticas)){
            //Traigo todos los id de las politicas
            await Politica.findAll().then( politicas => {
                //Comparo los id pasados con los id de politicas existentes
                arrayPoliticas.forEach( p => {
                    idPoliticas_ok = false
                    for (i=0; (i < politicas.length && !idPoliticas_ok); i++){
                        if (politicas[i].id == p){
                            idPoliticas_ok = true
                        }
                    }
                    //Si el id chequeado no se encuentra entre los existentes, se lanza error
                    if (!idPoliticas_ok) {
                        throw {status: 404, message: "No se encontró politica id="+p}
                    }
                })
            })
            //Si llega hasta acá es porque todos los ids son correctos
            return idPoliticas_ok
        } else {
            throw {status: 400, message: "Formato no válido en los id de politicas"}
        }
    } catch (error) {
        if (error.status == null ) error.status = 500
        throw error
    }
}