const express = require("express");
const router = express.Router();
const { authorizeRole } = require("../middleware/authorizeCustomerAdmin.js");
const customeradminController = require('../controllers/customeradminController.js');


router.get("/mymanagers", authorizeRole("customer-admin"), customeradminController.listMyManagers);

module.exports = router;
