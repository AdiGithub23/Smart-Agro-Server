"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class NotificationReceiver extends Model {
    static associate(models) {
        NotificationReceiver.belongsTo(models.Notification, {
        foreignKey: "notificationId",
        as: "notification",
      });
      NotificationReceiver.belongsTo(models.User, {
        foreignKey: "receiverId",
        as: "receivers",
      });
    }
  }
  NotificationReceiver.init(
    {
    notificationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Notifications",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    },
    {
      sequelize,
      modelName: "NotificationReceiver",
    }
  );
  return NotificationReceiver;
};
