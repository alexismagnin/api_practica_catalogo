const db = require("../models")
const sequelize = db.sequelize
const Politica = db.politica

exports.getAll = (req, res) => {
    Politica.findAll({
        attributes: ["id", ["politica","nombre"]]
    })
        .then( result => {
            return res.status(200).send(result)
        })
        .catch( error => {
            return res.status(500).send(error.message)
        })
}