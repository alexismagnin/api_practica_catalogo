'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Roles_politicas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unsigned: true,
        type: Sequelize.INTEGER
      },
      rol_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unsigned: true,
        references: {
          model: "Roles",
          key: "id"
        }
      },
      politica_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unsigned: true,
        references: {
          model: "Politicas",
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
    await queryInterface.dropTable('Roles_politicas');
  }
};