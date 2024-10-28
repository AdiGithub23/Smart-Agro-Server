module.exports = (sequelize, DataTypes) => {
  const Parameter = sequelize.define(
    "Parameter",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      parameter: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      min_value: {
        type: DataTypes.FLOAT,
      },
      max_value: {
        type: DataTypes.FLOAT,
      },
    },
    {
      timestamps: false,
    }
  );

  return Parameter;
};
