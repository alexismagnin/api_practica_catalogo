'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unsigned: true,
        type: Sequelize.INTEGER
      },
      cuenta: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      pass: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      rol_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        unsigned: true,
        references: {
          model: "Roles",
          key: "id"
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Usuarios');
  }
};