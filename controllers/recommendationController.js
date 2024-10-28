const { District, Division, GsDivision, Image } = require('../models');
const gsDivision = require('../models/gsDivision');

exports.viewDistricts = async (req, res) => {
  try {
    const districts = await District.findAll({
      order: [['id', 'ASC']],
    });

    if (districts.length === 0) {
      return res.status(404).json({ message: 'No districts found.' });
    }

    return res.status(200).json(districts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching districts.' });
  }
};

exports.viewDivisions = async (req, res) => {
  try {
    const { districtId } = req.params;

    if (!districtId) {
      return res.status(400).json({ message: 'Please select a district.' });
    }

    const divisions = await Division.findAll({
      where: { districtId },
      attributes: ['id', 'name'],
    });

    if (divisions.length === 0) {
      return res.status(404).json({ message: 'No divisions found for the given district.' });
    }

    return res.status(200).json(divisions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching divisions.' });
  }
};

exports.viewGsDivisions = async (req, res) => {
  try {
    const { divisionId } = req.params;

    if (!divisionId) {
      return res.status(400).json({ message: 'Please select a GS division.' });
    }

    const gsDivisions = await GsDivision.findAll({
      where: { divisionId },
      attributes: ['id', 'name'],
    });

    if (gsDivisions.length === 0) {
      return res.status(404).json({ message: 'No gs divisions found for the given division.' });
    }

    return res.status(200).json(gsDivisions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching divisions.' });
  }
};

exports.viewGsImages = async (req, res) => {
  try {
    const { gsDivisionId } = req.params;

    if (!gsDivisionId) {
      return res.status(400).json({ message: 'Please select a GS division.' });
    }

    const images = await Image.findAll({
      where: { gsDivisionId },
      attributes: ['gsDivisionId','id', 'url'],
    });

    if (images.length === 0) {
      return res.status(404).json({ message: 'No gs divisions found for the given division.' });
    }

    return res.status(200).json(images);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching divisions.' });
  }
};

