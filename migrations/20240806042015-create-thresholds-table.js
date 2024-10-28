"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Thresholds", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      CropName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      Stage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      min_AirTemperature: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      max_AirTemperature: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      min_RelativeAirHumidity: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      max_RelativeAirHumidity: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      min_Rainfall: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      max_Rainfall: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      min_SoilTemperature: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      max_SoilTemperature: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      min_SoilMoisture: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      max_SoilMoisture: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      min_SoilpH: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      max_SoilpH: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      min_SoilEC: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      max_SoilEC: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      min_SoilNitrogen: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      max_SoilNitrogen: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      min_SoilPhosphorous: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      max_SoilPhosphorous: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      min_SoilPotassium: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      max_SoilPotassium: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Thresholds");
  },
};
