"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Inventories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      serial_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      model_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Packages",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      secret_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      device_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "In Stock",
        validate: {
          isIn: [["Assigned", "In Stock"]],
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Inventories");
  },
};
