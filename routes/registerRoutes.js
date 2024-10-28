const express = require("express");
const router = express.Router();
const { inventoryCheck, register } = require("../controllers/registerController");

router.post("/inventory", inventoryCheck);
router.post("/", register);

module.exports = router;
