const nodemailer = require("nodemailer");

const sendPasswordResetEmail = async (to, url) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    to,
    from: "smartagrofazenda@gmail.com",
    subject: "Password Reset",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
    Please use the following code to complete the process:\n\n
    ${url}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };
