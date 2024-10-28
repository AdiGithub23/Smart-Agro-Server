const express = require("express");
const router = express.Router();
const sensorController = require("../controllers/sensorController");

router.get("/tiles/:id", sensorController.getTileData);
router.get("/graph/:id", sensorController.getDataforGraph);
router.get("/download/:device_id", sensorController.downloadableSensorData);
router.get("/:id",sensorController.getGraphData)
router.get("/graph/date/:id",sensorController.getTimeBasedGraphData)

// Route for creating a new sensor
router.post('/', sensorController.createSensor);

// Route for updating an existing sensor
router.put('/update/:id', sensorController.updateSensor);

module.exports = router;
