const express = require("express");
const router = express.Router();
const {
  createYield,
  deleteYield,
  graphYieldData,
  tileYieldData,
  editYield,
  downloadableData,
} = require("../controllers/yieldController");

router.post("/add/:device_id", createYield);
router.delete("/delete/:id", deleteYield);
router.get("/graph/:device_id", graphYieldData);
router.get("/tile/:device_id", tileYieldData);
router.put("/edit/:id", editYield);
router.get("/download/:device_id", downloadableData);

module.exports = router;
