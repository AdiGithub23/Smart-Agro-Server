const express = require('express');
const router = express.Router();
const { handleFormSubmission } = require('../controllers/contactUsController');

router.post('/submit-form', handleFormSubmission);

module.exports = router;
