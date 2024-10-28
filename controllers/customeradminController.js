const { User } = require("../models");

const listMyManagers = async (req, res) => {
    try {
        if (req.user.role !== 'customer-admin') {
          console.log("\nUser-Role: ", req.user.role)
          return res.status(403).json({ error: 'Unauthorized access' });
        }
        const myManagers = await User.findAll({ where: 
            { 
                user_role: 'customer-manager', 
                createdById: req.user.id 
            }
         });
        res.json(myManagers);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
};

module.exports = {
    listMyManagers,
};
