const express = require("express");
const router = express.Router();
const parameterController = require("../controllers/parameterController");

router.get("/", parameterController.getParameters);
router.get("/device/:id", parameterController.getParametersByDeviceId);

module.exports = router;
