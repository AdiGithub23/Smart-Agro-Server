const { Package } = require("../models");

exports.createPackage = async (req, res) => {
  try {
    const {
      packageName,
      connectivityType,
      monthlyRental,
      features,
      poleOrPortable,
      landingPageVisibility,
      parameters,
      fixedCharge,
    } = req.body;

    const formattedMonthlyRental = parseFloat(parseFloat(monthlyRental).toFixed(2));
    const formattedFixedCharge = parseFloat(parseFloat(fixedCharge).toFixed(2));

    const newPackage = await Package.create({
      packageName,
      connectivityType,
      monthlyRental: formattedMonthlyRental, 
      features,
      poleOrPortable,
      landingPageVisibility,
      parameters,
      fixedCharge: formattedFixedCharge, 
    });

    res.status(201).json(newPackage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getPackages = async (req, res) => {
  try {
    const packages = await Package.findAll({
      order: [['id', 'ASC']], 
    });
    res.status(200).json(packages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      packageName,
      connectivityType,
      monthlyRental,
      fixedCharge,
      features,
      poleOrPortable,
      landingPageVisibility,
      parameters,
    } = req.body;

    const formattedMonthlyRental = parseFloat(monthlyRental).toFixed(2);
    const formattedFixedCharge = parseFloat(fixedCharge).toFixed(2);

    const [updated] = await Package.update(
      {
        packageName,
        connectivityType,
        monthlyRental : formattedMonthlyRental,
        fixedCharge : formattedFixedCharge,
        features,
        poleOrPortable,
        landingPageVisibility,
        parameters,
      },
      { where: { id } }
    );
    if (updated) {
      const updatedPackage = await Package.findByPk(id);
      res.status(200).json(updatedPackage);
    } else {
      res.status(404).json({ error: "Package not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Package.destroy({ where: { id } });
    if (deleted) {
      res.status(200).json({ message: "Package deleted successfully" });
    } else {
      res.status(404).json({ error: "Package not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLatestPackageId = async (req, res) => {
  try {
    const latestPackage = await Package.findOne({
      order: [['id', 'DESC']],
    });

    const latestId = latestPackage ? latestPackage.id + 1 : 1; 
    
    res.status(200).json(latestId);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};