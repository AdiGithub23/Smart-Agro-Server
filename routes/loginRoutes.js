const express = require("express");
const {
  login,
  forgotPassword,
  resetPassword,
  verifyCode,
} = require("../controllers/loginController");

const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyCode);
router.post("/reset-password", resetPassword);

module.exports = router;