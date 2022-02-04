'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rol_politica extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Rol_politica.init({
    rol_id: DataTypes.INTEGER,
    politica_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Rol_politica',
  });
  return Rol_politica;
};