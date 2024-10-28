const express = require("express");
const router = express.Router();
const deviceManagerController = require("../controllers/deviceManagerController");

// Routes for device managers
router.post("/", deviceManagerController.createDeviceManager);
router.get("/", deviceManagerController.getAllDeviceManagers);
router.get("/:id", deviceManagerController.getDeviceManagerById);
router.put("/:id", deviceManagerController.updateDeviceManager);
router.delete("/:id", deviceManagerController.deleteDeviceManager);

// Route to get devices by manager ID
router.get("/manager/:managerId", deviceManagerController.getDevicesByManagerId);

module.exports = router;
