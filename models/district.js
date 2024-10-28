'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class District extends Model {
    static associate(models) {
      District.hasMany(models.Division, { foreignKey: 'districtId' });
    }
  }
  District.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'District',
      timestamps: false,
    }
  );
  return District;
};
