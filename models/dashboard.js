module.exports = (sequelize, DataTypes) => {
  const Dashboard = sequelize.define(
    "Dashboard",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      device_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Devices",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      poleOrPortable: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      real_time: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      alerts: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      analysis: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      yield: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Dashboards",
    }
  );

  Dashboard.associate = (models) => {
    Dashboard.belongsTo(models.Device, {
      foreignKey: "device_id",
      as: "device",
    });
  };

  return Dashboard;
};
