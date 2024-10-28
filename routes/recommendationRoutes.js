const express = require('express');
const {
  viewDistricts,
  viewDivisions,
  viewGsDivisions,
  viewGsImages
} = require('../controllers/recommendationController');

const router = express.Router();
router.get('/districts',viewDistricts);
router.get('/divisions/:districtId',viewDivisions);
router.get('/gs_divisions/:divisionId',viewGsDivisions);
router.get('/gs_images/:gsDivisionId',viewGsImages);

module.exports = router;
