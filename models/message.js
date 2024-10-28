module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, { as: 'Sender', foreignKey: 'senderId', onDelete: 'CASCADE', });
    Message.belongsTo(models.User, { as: 'Receiver', foreignKey: 'receiverId', onDelete: 'CASCADE', });
  };

  return Message;
};

  