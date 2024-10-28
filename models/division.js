'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Division extends Model {
    static associate(models) {
      Division.belongsTo(models.District, { foreignKey: 'districtId' });
      Division.hasMany(models.GsDivision, { foreignKey: 'divisionId' });
    }
  }
  Division.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      districtId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'District',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Division',
      timestamps: false,
    }
  );
  return Division;
};
