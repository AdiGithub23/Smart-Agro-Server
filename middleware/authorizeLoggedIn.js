const util = require('util'); 
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utility/auth');
const { User } = require('../models');

exports.protect = async (req, res, next) => {
    const testToken = req.headers.authorization;  
    let token;
    let decodedToken;

    if (testToken && testToken.startsWith("Bearer")) {
      token = testToken.split(" ")[1];
    }
    console.log("\nToken Received:", token); 

    if (!token) {
      return res.status(401).json({ message: "UnAuthorized!" });
    }

    try {
      decodedToken = verifyToken(token);
      if (!decodedToken) {
        return res.status(401).json({ error: "Invalid token!" });
      }
      console.log("\nDecoded Token:", decodedToken); // Decoded Token
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token has expired!" });
      }
      return res.status(500).json({ error: "Internal server error", details: error.message });
    }

    const user = await User.findByPk(decodedToken.id);
    if (!user) {
      return res.status(401).json({ error: "Token Does not Exist!" });
    }

    req.user = user;
    next();
};
