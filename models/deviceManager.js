module.exports = (sequelize, DataTypes) => {
  const DeviceManager = sequelize.define("DeviceManager", {
    device_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Device",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    manager_name: {
      type: DataTypes.STRING,
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
  });

  DeviceManager.associate = (models) => {
    DeviceManager.hasMany(models.Device, {
      as: "device",
      foreignKey: "id"
    });
    DeviceManager.belongsTo(models.User, {
      as: "manager",
      foreignKey: "manager_id"
    });
  };

  return DeviceManager;
};
