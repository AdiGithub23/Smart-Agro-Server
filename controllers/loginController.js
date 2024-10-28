const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { generateToken, verifyToken } = require("../utility/auth");
const { sendPasswordResetEmail } = require("../utility/email");
const { Op } = require("sequelize");
const crypto = require("crypto");

// Default login Function
// const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }
//     const isPasswordMatch = await bcrypt.compare(password, user.password);
//     if (!isPasswordMatch) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }
//     const token = generateToken(user);

//     let redirectUrl = "";
//     switch (user.user_role) {
//       case "super-admin":
//         redirectUrl = "/superadmin";
//         break;
//       case "slt-admin":
//         redirectUrl = "/adminSLT";
//         break;
//       case "customer-admin":
//         redirectUrl = "/customerAdmin";
//         break;
//       case "customer-manager":
//         redirectUrl = "/customerManager";
//         break;
//       default:
//         return res.status(403).json({ error: "Unauthorized access" });
//     }

//     res.json({ token, redirectUrl });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ 
      where: { 
        email,
        visibility: true,
      } 
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials or user unavailble" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user);
    let redirectUrl = "";
    switch (user.user_role) {
      case "super-admin":
        redirectUrl = "/superadmin";
        break;
      case "slt-admin":
        redirectUrl = "/adminsltdashboard";
        break;
      case "customer-admin":
        redirectUrl = "/admincoustomerdashboard";
        break;
      case "customer-manager":
        redirectUrl = "/managerdashboard";
        break;
      default:
        redirectUrl = "/login";
    }

    res.json({ token, redirectUrl });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ error: "Email is not registered with the system" });
    }

    const otpCode = crypto.randomInt(100000, 999999).toString();

    user.resetPasswordToken = otpCode;
    user.resetPasswordExpires = new Date(Date.now() + 600000);
    await user.save();

    await sendPasswordResetEmail(user.email, `Your OTP is: ${otpCode}`);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const verifyCode = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: code,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "OTP is invalid or has expired" });
    }

    res.status(200).json({
      message: "Verification successful",
      redirectUrl: `/changepassword?code=${code}`,
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { code, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: code,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "OTP is invalid or has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res
      .status(200)
      .json({ message: "Password has been reset. Please login again." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  login,
  forgotPassword,
  verifyCode,
  resetPassword,
};
