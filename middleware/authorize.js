const { verifyToken } = require('../utility/auth');
const { User } = require('../models');

const authorizeRole = (role) => {
  return async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(403).json({ error: 'No token provided' });
    }
    try {
      const user = verifyToken(token);
      const userData = await User.findByPk(user.id); 
      if (user && user.role === role) {
        req.user = { ...user, createdById: userData.createdById }; 
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
// const authorizeRole = (role) => {
//   return (req, res, next) => {
//     const token = req.headers.authorization.split(' ')[1];
//     if (!token) {
//       return res.status(403).json({ error: 'No token provided' });
//     }
//     try {
//       const user = verifyToken(token);
//       if (user && user.role === role) {
//         req.user = user;
//         next();
//       } else {
//         console.log('Unauthorized access. User role:', user?.role);
//         res.status(403).json({ error: 'Unauthorized access' });
//       }
//     } catch (err) {
//       console.log('Error verifying token:', err.message);
//       res.status(403).json({ error: 'Invalid token' });
//     }
//   };
// };

const authorizeSuperAdmin = (req, res, next) => {
  authorizeRole('super-admin')(req, res, next);
};
const authorizeSltAdmin = (req, res, next) => {
  authorizeRole('slt-admin')(req, res, next);
};
const authorizeSuperAdminOrSltAdmin = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }
  try {
    const user = verifyToken(token);
    if (user && (user.role === 'super-admin' || user.role === 'slt-admin' || user.role === 'customer-admin')) {
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

const authorizeSltOrCustomOrManager = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }
  try {
    const user = verifyToken(token);
    const userData = await User.findByPk(user.id); 
    if (user && (user.role === 'slt-admin' || user.role === 'customer-admin' || user.role === 'customer-manager')) {
      req.user = { ...user, createdById: userData.createdById };
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

// const authorizeSltOrCustomOrManager = async (req, res, next) => {
//   const token = req.headers.authorization.split(' ')[1];
//   if (!token) {
//     return res.status(403).json({ error: 'No token provided' });
//   }
  
//   try {
//     const user = verifyToken(token);
//     if (user && (user.role === 'slt-admin' || user.role === 'customer-admin' || user.role === 'customer-manager')) {
//       req.user = user;
//       next();
//     } else {
//       console.log('Unauthorized access. User role:', user?.role);
//       res.status(403).json({ error: 'Unauthorized access' });
//     }
//   } catch (err) {
//     console.log('Error verifying token:', err.message);
//     res.status(403).json({ error: 'Invalid token' });
//   }
// };


module.exports = { authorizeRole, authorizeSuperAdmin, authorizeSltAdmin, authorizeSuperAdminOrSltAdmin, authorizeSltOrCustomOrManager };
