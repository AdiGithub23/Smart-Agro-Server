const { Threshold, Device, Parameter, Package, Sensor } = require("../models");
const { Op } = require("sequelize");

const thresholdMapping = {
  "Air Temperature": {
    minField: "min_AirTemperature",
    maxField: "max_AirTemperature",
  },
  "Relative Air Humidity": {
    minField: "min_RelativeAirHumidity",
    maxField: "max_RelativeAirHumidity",
  },
  Rainfall: {
    minField: "min_Rainfall",
    maxField: "max_Rainfall",
  },
  "Soil Temperature": {
    minField: "min_SoilTemperature",
    maxField: "max_SoilTemperature",
  },
  "Soil Moisture": {
    minField: "min_SoilMoisture",
    maxField: "max_SoilMoisture",
  },
  "Soil pH": {
    minField: "min_SoilpH",
    maxField: "max_SoilpH",
  },
  "Soil EC": {
    minField: "min_SoilEC",
    maxField: "max_SoilEC",
  },
  "Soil Nitrogen": {
    minField: "min_SoilNitrogen",
    maxField: "max_SoilNitrogen",
  },
  "Soil Phosphorous": {
    minField: "min_SoilPhosphorous",
    maxField: "max_SoilPhosphorous",
  },
  "Soil Potassium": {
    minField: "min_SoilPotassium",
    maxField: "max_SoilPotassium",
  },
};

async function addThreshold(req, res) {
  try {
    const { deviceId, status } = req.body;
    if (status === true) {
      const existingThreshold = await Threshold.findOne({
        where: { deviceId, status: true },
      });

      if (existingThreshold) {
        return res
          .status(400)
          .json({ error: "Only one active threshold is allowed per device." });
      }
    }

    const threshold = await Threshold.create(req.body);
    res.status(201).json(threshold);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function viewAllThresholds(req, res) {
  try {
    const thresholds = await Threshold.findAll();
    res.status(200).json(thresholds);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function viewThresholdByID(req, res) {
  try {
    const thresholds = await Threshold.findAll({
      where: {
        deviceId: req.params.id,
      },
    });

    const dataValues = thresholds.map((threshold) => threshold.dataValues);

    const transformThreshold = (threshold) => {
      const transformed = {
        id: threshold.id,
        CropName: threshold.CropName,
        Stage: threshold.Stage,
        status: threshold.status,
        deviceId: threshold.deviceId,
        createdAt: threshold.createdAt,
        updatedAt: threshold.updatedAt,
        parameters: [],
      };

      const parameterMap = {
        "Air Temperature (°C)": ["min_AirTemperature", "max_AirTemperature"],
        "Relative Air Humidity (%RH)": [
          "min_RelativeAirHumidity",
          "max_RelativeAirHumidity",
        ],
        "Rainfall (mm)": ["min_Rainfall", "max_Rainfall"],
        "Soil Temperature (°C)": ["min_SoilTemperature", "max_SoilTemperature"],
        "Soil Moisture (%)": ["min_SoilMoisture", "max_SoilMoisture"],
        "Soil pH": ["min_SoilpH", "max_SoilpH"],
        "Soil EC (µS/cm)": ["min_SoilEC", "max_SoilEC"],
        "Soil Nitrogen (ppm)": ["min_SoilNitrogen", "max_SoilNitrogen"],
        "Soil Phosphorous (ppm)": [
          "min_SoilPhosphorous",
          "max_SoilPhosphorous",
        ],
        "Soil Potassium (ppm)": ["min_SoilPotassium", "max_SoilPotassium"],
      };

      for (const [key, [minKey, maxKey]] of Object.entries(parameterMap)) {
        if (threshold[minKey] !== null || threshold[maxKey] !== null) {
          transformed.parameters.push({
            name: key,
            min: threshold[minKey],
            max: threshold[maxKey],
          });
        }
      }

      return transformed;
    };

    const cleanedThresholds = dataValues
      .map(transformThreshold)
      .filter((threshold) => threshold.parameters.length > 0);

    if (cleanedThresholds.length > 0) {
      cleanedThresholds.sort((a, b) => a.id - b.id);

      res.status(200).json(cleanedThresholds);
    } else {
      res
        .status(404)
        .json({ error: "No valid thresholds found for this device" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function editThreshold(req, res) {
  try {
    const { deviceId, status } = req.body;
    if (status === true) {
      const existingThreshold = await Threshold.findOne({
        where: { deviceId, status: true },
      });

      if (existingThreshold) {
        return res
          .status(400)
          .json({ error: "Only one active threshold is allowed per device." });
      }
    }
    const [updated] = await Threshold.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedThreshold = await Threshold.findByPk(req.params.id);
      res.status(200).json(updatedThreshold);
    } else {
      res.status(404).json({ error: "Threshold not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteThreshold(req, res) {
  try {
    const threshold = await Threshold.findOne({
      where: { id: req.params.id },
    });

    if (!threshold) {
      return res.status(404).json({ error: "Threshold not found" });
    }

    if (threshold.status === false) {
      await Threshold.destroy({
        where: { id: req.params.id },
      });
      return res.status(200).json({ message: "Threshold deleted successfully" });
    } else {
      return res.status(403).json({ error: "Deactivate the Threshold status prior to delete" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getParameterValues(req, res) {
  try {
    const { id } = req.params;

    const device = await Device.findOne({
      where: { id: id },
      include: {
        model: Package,
        as: "package",
      },
    });

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    const pkg = device.package;

    if (!pkg) {
      return res
        .status(404)
        .json({ error: "Package not found for this device" });
    }

    const parameters = pkg.parameters;
    const results = [];

    for (const parameterName of parameters) {
      const thresholdParam = thresholdMapping[parameterName];

      const [parameter, threshold] = await Promise.all([
        Parameter.findOne({
          where: { parameter: parameterName },
          attributes: ["unit", "min_value", "max_value"],
        }),
        thresholdParam
          ? Threshold.findOne({
              where: { deviceId: id, status: true },
              attributes: [thresholdParam.minField, thresholdParam.maxField],
            }).catch(() => null) 
          : Promise.resolve(null),
      ]);

      const unit = parameter ? parameter.unit : null;
      const min = parameter ? parameter.min_value : null;
      const max = parameter ? parameter.max_value : null;
      const iMin = threshold ? threshold[thresholdParam.minField] : null;
      const iMax = threshold ? threshold[thresholdParam.maxField] : null;

      results.push({
        name: parameterName,
        unit: unit,
        min: min,
        max: max,
        min_threshold: iMin, 
        max_threshold: iMax,
      });
    }

    return res.status(200).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "An error occurred while retrieving data points",
    });
  }
}

module.exports = {
  addThreshold,
  viewAllThresholds,
  viewThresholdByID,
  editThreshold,
  deleteThreshold,
  getParameterValues,
};
