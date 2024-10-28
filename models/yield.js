"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Yield extends Model {
    static associate(models) {
      Yield.belongsTo(models.Device, {
        foreignKey: "deviceId",
        as: "device",
      });
    }
  }
  Yield.init(
    {
      crop_name: DataTypes.STRING,
      quantity: DataTypes.DECIMAL,
      unit_price: DataTypes.DECIMAL,
      total: DataTypes.DECIMAL,
      deviceId: DataTypes.INTEGER,
      date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      time: {
        type: DataTypes.TIME,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Yield",
      timestamps: false,
    }
  );
  return Yield;
};
