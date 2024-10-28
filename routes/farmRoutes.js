const express = require('express');
const router = express.Router();
const farmController = require("../controllers/farmController");
const { authorizeRole } = require("../middleware/authorizeCustomerAdmin.js");

router.get("/", farmController.getFarms);
router.get('/count', farmController.getFarmCount);
router.post("/", authorizeRole("customer-admin"), farmController.createFarm);
router.post('/upload/:userId', express.raw({ type: 'application/octet-stream', limit: '50mb' }), farmController.uploadFarms);
router.get("/:userId", farmController.getFarmsByUserId);
router.get('/customer-count/:userId', farmController.getFarmCountByUserId);
router.get('/manager-count/:userId', farmController.getManagerFarmCount);
router.put("/:id", farmController.updateFarm);
router.delete("/:id", farmController.deleteFarm);

module.exports = router;
