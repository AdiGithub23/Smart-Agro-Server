const jwt = require('jsonwebtoken');
const config = require('./config');

const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.user_role,
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiry });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
