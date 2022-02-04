'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Politica extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Politica.belongsToMany(models.Rol, {
        through: "Rol_politica",
        foreignKey: "politica_id",
        as: "roles"
      })
    }
  }
  Politica.init({
    politica: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Politica',
  });
  return Politica;
};