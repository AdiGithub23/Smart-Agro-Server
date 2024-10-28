"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.Device, {
        foreignKey: "deviceId",
        as: "device",
      });
      Notification.hasMany(models.NotificationReceiver, {
        foreignKey: "notificationId",
        as: "receivers",
      });
      Notification.belongsTo(models.User, {
        foreignKey: "receiverId",
        as: "receiver",  // Add this alias
      });     
    }
  }
  Notification.init(
    {
      deviceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Devices",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      notificationType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      notificationTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      receiverId: {  // New field
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Notification",
    }
  );
  return Notification;
};
