module.exports = (sequelize, DataTypes) => {
  const Farm = sequelize.define("Farm", {
    farm_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    farmAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    farmContactNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    farmEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  });

  Farm.associate = function (models) {
    // Farm.belongsToMany(models.Device, { through: 'FarmDevices', as: 'devices', foreignKey: 'farm_id', otherKey: 'deviceId', });
    Farm.belongsToMany(models.User, { through: 'FarmManagers', as: 'managers', foreignKey: 'farm_id', otherKey: 'userId', });
    Farm.hasMany(models.Device, { as: 'devices', foreignKey: 'farm_id' });
    // Farm.hasMany(models.User, { as: 'managers', foreignKey: 'company', sourceKey: 'farm_name' });
    Farm.belongsTo(models.User, { as: 'customer', foreignKey: 'createdById' });
  };

  return Farm;
};
