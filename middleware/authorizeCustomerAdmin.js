const { verifyToken } = require('../utility/auth');

const authorizeRole = (role) => {
  return (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]; 
    if (!token) {
      return res.status(403).json({ error: 'No token provided' });
    }
    try {
      const user = verifyToken(token);
      if (user && user.role === role) {
        req.user = user;
        next();
      } else {
        console.log('Unauthorized access. User role:', user?.role);
        res.status(403).json({ error: 'Unauthorized access' });
      }
    } catch (err) {
      console.log('Error verifying token:', err.message);
      res.status(403).json({ error: 'Invalid token' });
    }
  };
};

module.exports = { authorizeRole };