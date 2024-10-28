const { User } = require("../models");

const listSltAdmins = async (req, res) => {
    try {
        if (req.user.role !== 'super-admin') {
          console.log("\nUser-Role: ", req.user.role)
          return res.status(403).json({ error: 'Unauthorized access' });
        }
        const sltAdmins = await User.findAll({ where: { user_role: 'slt-admin' } });
        res.json(sltAdmins);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
};

module.exports = {
  listSltAdmins,
};
