module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define("Package", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    packageName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    connectivityType: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    monthlyRental: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fixedCharge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    features: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    poleOrPortable: {
      type: DataTypes.ENUM,
      values: ["Pole", "Portable"],
      allowNull: false,
    },
    landingPageVisibility: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    parameters: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  Package.associate = function (models) {
    Package.hasMany(models.Inventory, {
      foreignKey: "package_id",
      as: "inventories",
    });
  };

  Package.associate = function (models) {
    Package.hasMany(models.Device, {
      foreignKey: "package_id",
      as: "devices",
    });
  };

  return Package;
};
