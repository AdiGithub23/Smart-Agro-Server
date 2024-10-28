const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const upload = require('../middleware/uploads');
const { authorizeSuperAdminOrSltAdmin, authorizeSuperAdmin, authorizeSltAdmin } = require('../middleware/authorize');
const { protect } = require('../middleware/authorizeLoggedIn');



router.post('/', upload.single('profile_picture'), authorizeSuperAdminOrSltAdmin, userController.createUser);
router.get('/next-id', userController.getNextUserId);
router.get('/', userController.getAllUsers);
router.get('/slt-admins', userController.getSLTAdmins);
router.get('/customer-admins', userController.getCustomerAdmins);
router.get('/customer-managers', userController.getCustomerManagers);
router.get('/count', userController.getUserCount);
router.get('/customer/count', userController.getCustomerCount);
router.get('/manager/count', userController.getManagerCount);
router.get('/me', protect, userController.getLoggedInUser);
router.get('/:id', userController.getUserById);
router.put('/:id', upload.single('profile_picture'), userController.updateUser);
// router.put('/:id', upload.single('profile_picture'), authorizeSuperAdminOrSltAdmin, userController.updateUser);
router.put('/:id', userController.deleteUser);
router.get('/manager/count/:userId', userController.getManagerCountByCustomer);
router.get('/customer/count/:userId', userController.getCustomerCountBySltAdmin);
router.get('/company/manager-count/:userId', userController.getManagerCountByCompany);


module.exports = router;
