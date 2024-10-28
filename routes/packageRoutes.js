const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { authorizeRole } = require('../middleware/authorize');

router.get('/', packageController.getPackages);
router.post('/', authorizeRole('slt-admin'), packageController.createPackage);
router.put('/:id', authorizeRole('slt-admin'), packageController.updatePackage);
router.delete('/:id', authorizeRole('slt-admin'), packageController.deletePackage);
router.get('/latest_id', packageController.getLatestPackageId);

module.exports = router;