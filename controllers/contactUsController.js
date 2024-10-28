const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateReferenceNumber() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomString = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    randomString += alphabet[randomIndex];
  }
  const numbers = "0123456789";
  let randomNumber = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    randomNumber += numbers[randomIndex];
  }
  return `#${randomNumber}${randomString}`;
}

async function sendEmailToAdmin(
  first_name,
  last_name,
  email,
  phone,
  company,
  subject,
  message,
  referenceNumber
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "smartagrofazenda@gmail.com",
    subject: `Fazenda Smart Agro - Ref: ${referenceNumber}`,
    text: `
      First Name: ${first_name}
      Last Name : ${last_name}
      Email     : ${email}
      Phone     : ${phone}
      Company   : ${company}
      Subject   : ${subject}
      Message   : ${message}
      Reference Number: ${referenceNumber}
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendConfirmationEmail(
  first_name,
  last_name,
  email,
  phone,
  company,
  subject,
  message,
  referenceNumber
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your Form Submission - Ref: ${referenceNumber}`,
    text: `
      Dear ${first_name} ${last_name},

      Thank you for contacting Fazenda - SmartAgro. Your reference number is ${referenceNumber}. We'll get back to you soon.

      Details of your email:

      First Name : ${first_name}
      Last Name  : ${last_name}
      Email      : ${email}
      Phone      : ${phone}
      Company    : ${company}
      Subject    : ${subject}
      Message    : ${message}

      Best regards,
      SLT Digital Labs
    `,
  };

  await transporter.sendMail(mailOptions);
}

const handleFormSubmission = async (req, res) => {
  const { first_name, last_name, email, phone, company, subject, message } =
    req.body;

  if (
    !first_name ||
    !last_name ||
    !email ||
    !phone ||
    !company ||
    !subject ||
    !message
  ) {
    return res.status(400).send("All fields are required");
  }

  const referenceNumber = generateReferenceNumber();

  try {
    await sendEmailToAdmin(
      first_name,
      last_name,
      email,
      phone,
      company,
      subject,
      message,
      referenceNumber
    );
    await sendConfirmationEmail(
      first_name,
      last_name,
      email,
      phone,
      company,
      subject,
      message,
      referenceNumber
    );
    res.status(200).send({ referenceNumber });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending emails");
  }
};

module.exports = { handleFormSubmission };
