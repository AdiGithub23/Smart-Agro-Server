const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.post("/", dashboardController.createDashboardSettings);
router.put("/", dashboardController.editDashboardSettings);
router.get("/", dashboardController.viewDashboardSettings);

module.exports = router;
