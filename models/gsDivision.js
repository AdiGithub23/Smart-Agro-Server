'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GsDivision extends Model {
    static associate(models) {
      GsDivision.belongsTo(models.Division, { foreignKey: 'divisionId' });
      GsDivision.hasMany(models.Image, { foreignKey: 'gsDivisionId' });
    }
  }
  GsDivision.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      divisionId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Division',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'GsDivision',
      tableName: 'Gs_divisions',
      timestamps: false,
    }
  );
  return GsDivision;
};
