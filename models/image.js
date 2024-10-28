'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      Image.belongsTo(models.GsDivision, { foreignKey: 'gsDivisionId' });
    }
  }
  Image.init(
    {
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gsDivisionId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'GsDivision',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Image',
      timestamps: false,
    }
  );
  return Image;
};
