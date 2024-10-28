module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [
          ["super-admin", "slt-admin", "customer-admin", "customer-manager"],
        ],
      },
    },
    company: {
      type: DataTypes.STRING,
    },
    profile_picture: {
      type: DataTypes.STRING,
      defaultValue: "uploads/profile_pictures/1725425622016-149071.png",
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    visibility: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  });

  User.associate = (models) => {
    User.belongsTo(models.User, { as: "creator", foreignKey: "createdById" });
    User.hasMany(models.User, { as: "managers", foreignKey: "createdById" });

    User.hasMany(models.Device, {
      foreignKey: "customer_id",
      as: "customers",
    });
    User.hasMany(models.DeviceManager, {
      foreignKey: "manager_id",
      as: "deviceManagers",
    });
    // User.belongsTo(models.Farm, { foreignKey: 'company', targetKey: 'farm_name'

    // });
    User.belongsToMany(models.Farm, {
      through: "FarmManagers",
      as: "farms",
      foreignKey: "userId",
      otherKey: "farm_id",
    })
    User.hasMany(models.NotificationReceiver, {
      foreignKey: "receiverId",
      as: "notifications",
    });
  };

  // Creating the Super-Admin
  User.beforeCreate(async (user, options) => {
    if (user.user_role === "super-admin") {
      const existingSuperAdmin = await User.findOne({
        where: { user_role: "super-admin" },
      });
      if (existingSuperAdmin) {
        throw new Error("A super-admin already exists.");
      }
    }
  });

  User.beforeSave((user, options) => {
    if (!user.profile_picture || user.profile_picture.trim() === "") {
      user.profile_picture =
        "uploads/profile_pictures/1725425622016-149071.png";
    }
  });

  return User;
};
