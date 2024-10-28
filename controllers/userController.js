const { User, DeviceManager } = require("../models");
const bcrypt = require("bcrypt");
const { sequelize } = require("../models");
const path = require("path");
const saltRounds = 10;

exports.createUser = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const user = req.body;

    // Set createdById for customer-manager
    if (
      user.user_role === "customer-manager" ||
      user.user_role === "customer-admin" ||
      user.user_role === "slt-admin"
    ) {
      user.createdById = req.user.id;
    }

    // Check if the user role is "slt-admin" and if the creator is not a super-admin
    if (user.user_role === "slt-admin" && req.user.role !== "super-admin") {
      return res
        .status(403)
        .json({ error: "Only super-admin can create slt-admin users" });
    }
    // Check if the user role is "customer-admin" and if the creator is not an "slt-admin"
    if (user.user_role === "customer-admin" && req.user.role !== "slt-admin") {
      return res
        .status(403)
        .json({ error: "Only slt-admin can create customer-admin users" });
    }
    // Check if the user role is "customer-admin" and if the creator is not an "slt-admin"
    if (
      user.user_role === "customer-manager" &&
      req.user.role !== "customer-admin"
    ) {
      return res
        .status(403)
        .json({
          error: "Only customer-admin can create customer-manager users",
        });
    }

    if (req.file) {
      user.profile_picture = `uploads/profile_pictures/${req.file.filename}`;
    }

    const existingUser = await User.findOne({ where: { email: user.email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    user.password = await bcrypt.hash(user.password, salt);
    const newUser = await User.create(user);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNextUserId = async (req, res) => {
  try {
    const maxUser = await User.findOne({
      attributes: [[sequelize.fn("MAX", sequelize.col("id")), "maxId"]],
    });

    const nextId = maxUser ? maxUser.get("maxId") + 1 : 1;

    res.status(200).json({ nextUserId: nextId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    // const users = await User.findAll({ where: { visibility: true } });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    // const user = await User.findByPk(id);
    const user = await User.findOne({ 
      where: { 
        id, 
        // visibility: true 
      } 
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // const salt = await bcrypt.genSalt(saltRounds);
    const { id } = req.params;
    const user = req.body;
    if (req.file) {
      user.profile_picture = `uploads/profile_pictures/${req.file.filename}`;
    } else {
        user.profile_picture = user.profile_picture || 'uploads/profile_pictures/1725425622016-149071.png';
    }
  

    if (user.password) {
      const salt = await bcrypt.genSalt(saltRounds);
      user.password = await bcrypt.hash(user.password, salt);
    }

    const [updated] = await User.update(user, { where: { id } });
    if (updated) {
      const updatedUser = await User.findByPk(id);
      
      if (updatedUser.user_role === 'customer-admin') {
        // Update the company for all associated customer-managers
        await User.update(
          { company: updatedUser.company }, 
          { where: { createdById: updatedUser.id, user_role: 'customer-manager' } }
        );
      }

      if (updatedUser.user_role === 'customer-manager') {
        // Update deviceManager table with managerName
        await DeviceManager.update(
          { manager_name: updatedUser.full_name }, 
          { where: { manager_id: id } }
        );
      }

      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // const deleted = await User.destroy({ where: { id } });
    const [updated] = await User.update({ visibility: false }, { where: { id } });
    
    if (updated) {
      res.status(200).json({ message: "User marked as invisible successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// #region Extra Functions 

// Get the count of users
exports.getUserCount = async (req, res) => {
  try {
    // const userCount = await User.count();    
    const userCount = await User.count({ where: { visibility: true } });
    res.status(200).json({ count: userCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get the count of customer-admins
exports.getCustomerCount = async (req, res) => {
  try {
    const customerCount = await User.count({
      where: {
        user_role: "customer-admin",
        visibility: true,
      },
    });
    res.status(200).json({ count: customerCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get the count of managers
exports.getManagerCount = async (req, res) => {
  try {
    const managerCount = await User.count({
      where: {
        user_role: "customer-manager",
        visibility: true,
      },
    });
    res.status(200).json({ count: managerCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all slt-admin users
exports.getSLTAdmins = async (req, res) => {
  try {
    const sltAdmins = await User.findAll({
      where: {
        user_role: "slt-admin",
        visibility: true,
      },
    });
    res.status(200).json(sltAdmins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get the count of managers by createdById
exports.getManagerCountByCustomer = async (req, res) => {
  try {
    const { userId } = req.params;

    const managerCount = await User.count({
      where: {
        user_role: "customer-manager",
        createdById : userId,
        visibility: true,
      },
    });
    res.status(200).json({ count: managerCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get the count of managers by company
exports.getManagerCountByCompany = async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findOne({
      where: { id: userId, visibility: true,},
      attributes: ["createdById"],
    });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const createdById = currentUser.createdById;

    const managerCount = await User.count({
      where: {
        createdById: createdById,
      },
    });

    res.status(200).json({ count: managerCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get the count of customer-admins by createdById
exports.getCustomerCountBySltAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const customerCount = await User.count({
      where: {
        user_role: "customer-admin",
        createdById : userId,
        visibility: true,
      },
    });
    res.status(200).json({ count: customerCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all customer-admin users
exports.getCustomerAdmins = async (req, res) => {
  try {
    const customerAdmins = await User.findAll({
      where: {
        user_role: "customer-admin",
        visibility: true,
      },
    });
    res.status(200).json(customerAdmins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all customer-manager users
exports.getCustomerManagers = async (req, res) => {
  try {
    const customerManagers = await User.findAll({
      where: {
        user_role: "customer-manager",
        visibility: true,
      },
    });
    res.status(200).json(customerManagers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLoggedInUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || !user.visibility) {
      return res.status(404).json({ message: "User not found or unavailable!" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("\ngetLoggedInUser Failed");
    res.status(500).json({ error: error.message });
  }
};

// #endregion 