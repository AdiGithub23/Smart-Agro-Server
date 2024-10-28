module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define("Inventory", {
    serial_no: {
      type: DataTypes.STRING,
      allowNull: false,
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
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "In Stock",
      validate: {
        isIn: [["Assigned", "In Stock"]],
      },
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

  Inventory.associate = function (models) {
    Inventory.belongsTo(models.Package, {
      foreignKey: "package_id",
      as: "package",
    });
  };

  Inventory.associate = (models) => {
    Inventory.belongsTo(models.Device, {
      foreignKey: "id",
      as: "device",
    });
  };

  return Inventory;
};