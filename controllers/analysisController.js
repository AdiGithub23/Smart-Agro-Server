const {
  Device,
  Package,
  Threshold,
  Parameter,
  Analysis,
} = require("../models");
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

const analysisColumnMapping = {
  "Air Temperature": "Air_Temperature",
  "Relative Air Humidity": "Relative_Air_Humidity",
  Rainfall: "Rainfall",
  "Soil Temperature": "Soil_Temperature",
  "Soil Moisture": "Soil_Moisture",
  "Soil pH": "Soil_pH",
  "Soil EC": "Soil_EC",
  "Soil Nitrogen": "Soil_Nitrogen",
  "Soil Phosphorous": "Soil_Phosphorous",
  "Soil Potassium": "Soil_Potassium",
};

exports.getGraphData = async (req, res) => {
  try {
    const { id } = req.params;

    const now = new Date();
    now.setHours(now.getHours() + 5);
    now.setMinutes(now.getMinutes() + 30); 

    const nextHalfHour = new Date(now);
    nextHalfHour.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0); 

    const end = new Date(nextHalfHour.getTime() + 24 * 60 * 60 * 1000);

    const finalEnd = new Date(
      Math.max(nextHalfHour.getTime() + 30 * 60 * 1000, end.getTime())
    );

    function formatDateTime(date) {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      const seconds = String(date.getUTCSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}+00`;
    }

    const formattedStart = formatDateTime(nextHalfHour);
    const formattedEnd = formatDateTime(finalEnd);

    console.log(`Fetching data from ${formattedStart} to ${formattedEnd}`);

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
      const analysisColumn = analysisColumnMapping[parameterName];

      if (thresholdParam) {
        const [threshold, parameter, analysisData] = await Promise.all([
          Threshold.findOne({
            where: { deviceId: id, status: true },
            attributes: [thresholdParam.minField, thresholdParam.maxField],
          }),
          Parameter.findOne({
            where: { parameter: parameterName },
            attributes: ["unit", "min_value", "max_value"],
          }),
          Analysis.findAll({
            where: {
              deviceId: id,
              recorded_at: {
                [Op.between]: [nextHalfHour, end],
              },
            },
            attributes: ["recorded_at", analysisColumn],
            order: [["recorded_at", "ASC"]],
            limit: 49,
          }),
        ]);

        const formattedDataPoints = analysisData.map((entry) => {
          const recordedAt = new Date(entry.recorded_at);

          recordedAt.setHours(recordedAt.getHours() - 5);
          recordedAt.setMinutes(recordedAt.getMinutes() - 30);
          
          const options = { hour: '2-digit', minute: '2-digit', hour12: false };
          const time = recordedAt.toLocaleTimeString('en-US', options);
          return {
            time,
            value: entry[analysisColumn],
          };
        });

        results.push({
          label: `${parameterName} (${parameter.unit})`,
          minThresholdValue: threshold
            ? threshold[thresholdParam.minField]
            : null,
          maxThresholdValue: threshold
            ? threshold[thresholdParam.maxField]
            : null,
          minParameterValue: parameter ? parameter.min_value : null,
          maxParameterValue: parameter ? parameter.max_value : null,
          values: formattedDataPoints,
        });
      } else {
        results.push({
          label: parameterName,
          error: "Parameter not mapped",
          minThresholdValue: null,
          maxThresholdValue: null,
          minParameterValue: null,
          maxParameterValue: null,
          values: [],
        });
      }
    }

    return res.status(200).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "An error occurred while retrieving thresholds and data points",
    });
  }
};

exports.createAnalysis = async (req, res) => {
  try {
    const {
      deviceId,
      Air_Temperature,
      Relative_Air_Humidity,
      ...otherAnalyseData
    } = req.body;

    const newAnalyse = await Analysis.create({
      deviceId,
      Air_Temperature,
      Relative_Air_Humidity,
      ...otherAnalyseData,
    });

    //await checkSensorValues(newSensor.deviceId);

    res
      .status(201)
      .send({ message: "Analyse created successfully", analyse: newAnalyse });
  } catch (error) {
    console.error("Error creating analyse:", error);
    res.status(500).send({ error: "Failed to create analyse." });
  }
};

exports.updateAnalysis = async (req, res) => {
  const analyseId = req.params.id;
  const updatedData = req.body;

  try {
    const analyse = await Analysis.findByPk(analyseId);
    if (!analyse) {
      console.error(`Analyse with ID ${analyseId} not found.`);
      return res
        .status(404)
        .send({ error: `Analyse with ID ${analyseId} not found.` });
    }

    await analyse.update(updatedData);

    //const updatedSensor = await updateSensorAndCheckNotifications(sensorId, updatedData);

    res.status(200).send({
      message: "Analyse updated and notifications checked.",
      analyse: updatedData,
    });
  } catch (error) {
    console.error("Error updating analyse:", error);
    res
      .status(500)
      .send({ error: "Failed to update analyse.", details: error.message });
  }
};
