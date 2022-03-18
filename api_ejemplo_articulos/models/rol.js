'use strict';
const {
  Model
} = require('sequelize');
const { Sequelize } = require('.');
module.exports = (sequelize, DataTypes) => {
  class Rol extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Rol.hasMany(models.Usuario, {
        foreignKey: "rol_id",
        as: "usuarios"
      }),

      Rol.belongsToMany(models.Politica, {
        through: "Rol_politica",
        foreignKey: "rol_id",
        as: "politicas"
      })
    }
  }
  Rol.init({
    rol: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Rol',
    tableName: 'Roles'
  });
  return Rol;
};