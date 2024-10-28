module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define(
    "Device",
    {
      inventoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Inventory",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      serial_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      device_label: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      model_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      package_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Packages",
          key: "id",
        },
      },
      secret_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      device_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customer_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      company_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
        defaultValue: null,
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
        defaultValue: null,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "User",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      assigned_SLT_admin: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      active_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Active",
        validate: {
          isIn: [["Active", "Inactive"]],
        },
      },
      farm_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      farm_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Farm",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
      hooks: {
        afterCreate: async (device, options) => {
          try {
            const Dashboard = sequelize.models.Dashboard;

            const package = await device.getPackage();
            const poleOrPortable = package ? package.poleOrPortable : "Unknown";

            const defaultSettings = {
              device_id: device.id,
              poleOrPortable: poleOrPortable,
              real_time: true,
              alerts: true,
              analysis: poleOrPortable === "Pole",
              yield: true,
            };

            await Dashboard.create(defaultSettings);
          } catch (error) {
            console.error("Error in afterCreate hook:", error);
            throw error; 
          }
        },
      },
    }
  );

  Device.associate = (models) => {
    Device.hasMany(models.DeviceManager, {
      as: "deviceManagers",
      foreignKey: "device_id",
    });
    Device.belongsTo(models.User, {
      as: "customer",
      foreignKey: "customer_id",
    });
    Device.belongsTo(models.Farm, {
      as: "farm",
      foreignKey: "farm_id",
    });
    Device.belongsTo(models.Inventory, {
      as: "inventory",
      foreignKey: "inventoryId",
    });
    Device.hasMany(models.Yield, {
      foreignKey: "deviceId",
      as: "yields",
    });
    Device.hasMany(models.Threshold, {
      foreignKey: "deviceId",
      as: "thresholds",
    });
    Device.belongsTo(models.Package, {
      as: "package",
      foreignKey: "package_id",
    });
    Device.hasMany(models.Sensor, {
      as: "sensors",
      foreignKey: "deviceId",
    });
    Device.hasMany(models.Notification, {
      foreignKey: "deviceId",
      as: "notifications",
    });
    Device.hasMany(models.Analysis, {
      as: "analyses",
      foreignKey: "deviceId",
    });
  };

  return Device;
};
