const express = require("express");
const router = express.Router();
const analysisController = require("../controllers/analysisController");

router.get("/:id", analysisController.getGraphData);

// Route for creating a new sensor
router.post('/', analysisController.createAnalysis);

// Route for updating an existing sensor
router.put('/update/:id', analysisController.updateAnalysis);

module.exports = router;
