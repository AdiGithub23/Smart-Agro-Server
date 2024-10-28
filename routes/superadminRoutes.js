const express = require("express");
const router = express.Router();
const { authorizeSuperAdmin } = require('../middleware/authorize');
const superadminController = require('../controllers/superadminController');

// Route to list all "slt-admin" users
router.get('/superadminuser', authorizeSuperAdmin, superadminController.listSltAdmins);

module.exports = router;
