const express = require("express");
const {
  addThreshold,
  viewAllThresholds,
  viewThresholdByID,
  editThreshold,
  deleteThreshold,
  getParameterValues,
} = require("../controllers/thresholdController");
const router = express.Router();

router.post("/add", addThreshold);
router.get("/", viewAllThresholds);
router.get("/view/:id", viewThresholdByID);
router.put("/edit/:id", editThreshold);
router.delete("/delete/:id", deleteThreshold);
router.get("/parameters/:id", getParameterValues);

module.exports = router;
