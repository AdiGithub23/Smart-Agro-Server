'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Threshold extends Model {
    static associate(models) {
      Threshold.belongsTo(models.Device, {
        foreignKey: 'deviceId',
        as: 'device',
      });
    }
  }

  Threshold.init(
    {
      CropName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Stage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      min_AirTemperature: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      max_AirTemperature: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      min_RelativeAirHumidity: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      max_RelativeAirHumidity: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      min_Rainfall: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      max_Rainfall: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      min_SoilTemperature: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      max_SoilTemperature: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      min_SoilMoisture: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      max_SoilMoisture: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      min_SoilpH: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      max_SoilpH: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      min_SoilEC: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      max_SoilEC: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      min_SoilNitrogen: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      max_SoilNitrogen: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      min_SoilPhosphorous: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      max_SoilPhosphorous: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      min_SoilPotassium: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      max_SoilPotassium: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      deviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Devices',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'Threshold',
    }
  );

  return Threshold;
};