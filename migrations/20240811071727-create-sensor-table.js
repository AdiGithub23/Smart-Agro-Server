"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Sensors", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      deviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Devices",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      Air_Temperature: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      Relative_Air_Humidity: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      Rainfall: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      Soil_Temperature: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      Soil_Moisture: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      Soil_pH: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      Soil_EC: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      Soil_Nitrogen: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      Soil_Phosphorous: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      Soil_Potassium: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      recorded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Sensors");
  },
};
