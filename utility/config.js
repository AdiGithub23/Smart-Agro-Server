require("dotenv").config();

module.exports = {
    jwtSecret: process.env.JWT_TOKEN,
    jwtExpiry: '10h',
  };
  