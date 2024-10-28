const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/deviceController");


router.get("/", deviceController.getAllDevices);

// Route to get device count
router.get("/count", deviceController.getDeviceCount);

// Route to get active device count
router.get("/active-count", deviceController.getActiveDeviceCount);

// Route to get device count by customer ID
router.get("/count/customer/:customerId", deviceController.getDeviceCountByCustomerId);

// Route to get device count by manager ID
router.get("/count/manager/:managerId", deviceController.getDeviceCountByManagerId);

// Route to get active device count by customer ID
router.get("/active-count/customer/:customerId", deviceController.getActiveDeviceCountByCustomerId);

// Route to get active device count by manager ID
router.get("/active-count/manager/:managerId", deviceController.getActiveDeviceCountByManagerId);

// Route to assign managers
router.post("/assign-manager/:id", deviceController.assignDeviceToManagers);

// Route to get devices by customer ID
router.get("/customer/:customerId", deviceController.getDevicesByCustomerId);

// Route to get all device locations
router.get("/locations", deviceController.getDevicesWithLocation);

// Route to get all device locations by customer
router.get("/customer/locations/:customer_id", deviceController.getDeviceLocationsByCustomerId);

// Route to get all device locations by manager
router.get("/manager/locations/:manager_id", deviceController.getDeviceLocationsByManagerId);

// Routes for devices
router.post("/", deviceController.createDevice);
router.get("/:id", deviceController.getDeviceById);
router.put("/:id", deviceController.updateDevice);

// Route to update assigned device manager
router.put('/devices/:deviceId/managers/:managerId', deviceController.updateDeviceManager);

router.delete("/:id", deviceController.deleteDevice);

// Route to delete assigned managers
router.delete("/assign-manager/devices/:deviceId/managers/:managerId", deviceController.deleteAssignedManager);

router.get("/customer-admin/:customer_id",deviceController.getDevicesByCustomerAdminID)

module.exports = router;