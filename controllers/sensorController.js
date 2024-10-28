const { Device, Package, Threshold, Parameter, Sensor } = require("../models");
// const { checkSensorValues } = require('C:/Users/DELL/Desktop/Fazenda 02-09-2024/backend/controllers/notificationController.js');
const { Sequelize, Op } = require("sequelize");
const { parse } = require("json2csv");

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

const sensorColumnMapping = {
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

const formatImageLabel = (label) => {
  return label.replace(/\s+/g, "_");
};

exports.getTileData = async (req, res) => {
  try {
    const { id } = req.params;

    const latestSensorData = await Sensor.findAll({
      where: { deviceId: id },
      order: [["recorded_at", "DESC"]],
      limit: 1,
    });

    const latestData = latestSensorData.length > 0 ? latestSensorData[0] : null;

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
      const sensorColumn = sensorColumnMapping[parameterName];
      const thresholdParam = thresholdMapping[parameterName];

      if (sensorColumn) {
        const [parameter, threshold] = await Promise.all([
          Parameter.findOne({
            where: { parameter: parameterName },
            attributes: ["unit", "min_value", "max_value"],
          }),
          thresholdParam
            ? Threshold.findOne({
                where: { deviceId: id, status: true },
                attributes: [thresholdParam.minField, thresholdParam.maxField],
              })
            : Promise.resolve(null),
        ]);

        const dataPointValue = latestData ? latestData[sensorColumn] : null;
        const unit = parameter ? parameter.unit : "";
        const minParameterValue = parameter ? parameter.min_value : null;
        const maxParameterValue = parameter ? parameter.max_value : null;
        const minThresholdValue = threshold
          ? threshold[thresholdParam.minField]
          : null;
        const maxThresholdValue = threshold
          ? threshold[thresholdParam.maxField]
          : null;

        results.push({
          label: unit ? `${parameterName} (${unit})` : parameterName,
          value: dataPointValue,
          image: formatImageLabel(parameterName),
          minThresholdValue: minThresholdValue,
          maxThresholdValue: maxThresholdValue,
          minParameterValue: minParameterValue,
          maxParameterValue: maxParameterValue,
        });
      } else {
        results.push({
          label: parameterName,
          value: null,
          image: formatImageLabel(parameterName),
          minThresholdValue: null,
          maxThresholdValue: null,
          minParameterValue: null,
          maxParameterValue: null,
        });
      }
    }

    return res.status(200).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "An error occurred while retrieving data points",
    });
  }
};

exports.getDataforGraph = async (req, res) => {
  try {
    const { id } = req.params;

    let now = new Date();
    now = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

    const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    function formatDateTime(date) {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      const seconds = String(date.getUTCSeconds()).padStart(2, "0");
      const milliseconds = String(date.getUTCMilliseconds() * 1000).padStart(
        6,
        "0"
      );
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}+00`;
    }

    function formatOutputDateTime(date) {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    const formattedStart = formatDateTime(start);
    const formattedNow = formatDateTime(now);

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
    const sensorColumns = parameters.map((param) => sensorColumnMapping[param]);

    const sensorData = await Sensor.findAll({
      where: {
        deviceId: id,
        recorded_at: {
          [Op.between]: [formattedStart, formattedNow],
        },
      },
      attributes: ["recorded_at", ...sensorColumns],
      order: [["recorded_at", "ASC"]],
    });

    const results = [];
    let lastTimestamp = null;

    for (const entry of sensorData) {
      const timestamp = new Date(entry.recorded_at);

      const formattedTimestamp = formatDateTime(timestamp);

      if (!lastTimestamp || timestamp - lastTimestamp >= 30 * 60 * 1000) {
        const dataPoint = {
          time_stamp: formatOutputDateTime(timestamp),
        };

        for (const parameterName of parameters) {
          const sensorColumn = sensorColumnMapping[parameterName];
          dataPoint[parameterName] = entry[sensorColumn];
        }

        results.push(dataPoint);
        lastTimestamp = timestamp;
      }
    }

    const limitedResults = results.slice(0, 48);

    return res.status(200).json(limitedResults);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "An error occurred while retrieving thresholds and data points",
    });
  }
};

exports.downloadableSensorData = async (req, res) => {
  try {
    const { device_id } = req.params;
    const { startDate, endDate, download } = req.query;

    const defaultEnd = new Date();
    const defaultStart = new Date();
    defaultStart.setMonth(defaultStart.getMonth() - 3);

    const start = startDate ? new Date(startDate) : defaultStart;
    const end = endDate ? new Date(endDate) : defaultEnd;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (end <= start) {
      return res
        .status(400)
        .json({ error: "End date must be after start date" });
    }

    const latestSensor = await Sensor.findAll({
      where: {
        deviceId: device_id,
        recorded_at: {
          [Op.between]: [start, end],
        },
      },
      order: [["recorded_at", "ASC"]],
    });

    const latestSensorArray = latestSensor.map((sensor) => sensor.toJSON());

    if (latestSensorArray.length === 0) {
      return res.status(204).json(null);
    }

    if (download === "true") {
      const csv = parse(latestSensorArray);

      res.header("Content-Type", "text/csv");
      res.attachment("sensor-data.csv");
      res.send(csv);
    } else {
      res.status(200).json(latestSensorArray);
    }
  } catch (err) {
    console.error("Error fetching sensor data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createSensor = async (req, res) => {
  try {
    const {
      deviceId,
      Air_Temperature,
      Relative_Air_Humidity,
      ...otherSensorData
    } = req.body;

    const newSensor = await Sensor.create({
      deviceId,
      Air_Temperature,
      Relative_Air_Humidity,
      ...otherSensorData,
    });

    res
      .status(201)
      .send({ message: "Sensor created successfully", sensor: newSensor });
  } catch (error) {
    console.error("Error creating sensor:", error);
    res.status(500).send({ error: "Failed to create sensor." });
  }
};

exports.updateSensor = async (req, res) => {
  const sensorId = req.params.id;
  const updatedData = req.body;

  try {
    const sensor = await Sensor.findByPk(sensorId);
    if (!sensor) {
      console.error(`Sensor with ID ${sensorId} not found.`);
      return res
        .status(404)
        .send({ error: `Sensor with ID ${sensorId} not found.` });
    }

    await sensor.update(updatedData);

    res.status(200).send({
      message: "Sensor updated and notifications checked.",
      sensor: updatedData,
    });
  } catch (error) {
    console.error("Error updating sensor:", error);
    res
      .status(500)
      .send({ error: "Failed to update sensor.", details: error.message });
  }
};

exports.getGraphData = async (req, res) => {
  try {
    const { id } = req.params;

    const latestSensorData = await Sensor.findOne({
      where: { deviceId: id },
      order: [["recorded_at", "DESC"]],
      attributes: ["recorded_at"],
    });

    let latestTime = latestSensorData ? new Date(latestSensorData.recorded_at) : new Date();
    const intervalDuration = 30 * 60 * 1000;

    const device = await Device.findOne({
      where: { id: id },
      include: { model: Package, as: "package" },
    });
    if (!device) return res.status(404).json({ error: "Device not found" });

    const pkg = device.package;
    if (!pkg) return res.status(404).json({ error: "Package not found for this device" });

    const parameters = pkg.parameters;
    const results = [];

    const parameterDetails = await Parameter.findAll({
      where: { parameter: parameters },
    });

    for (const parameterName of parameters) {
      const thresholdParam = thresholdMapping[parameterName];
      const sensorColumn = sensorColumnMapping[parameterName];

      if (thresholdParam) {
        const threshold = await Threshold.findOne({
          where: { 
            deviceId: id,
            status: true,
            [thresholdParam.minField]: { [Op.not]: null },
            [thresholdParam.maxField]: { [Op.not]: null }
          },
          attributes: [thresholdParam.minField, thresholdParam.maxField],
        });

        const parameter = parameterDetails.find(param => param.parameter === parameterName);

        const startTime = new Date(latestTime.getTime() - 48 * intervalDuration);
        const sensorData = await Sensor.findAll({
          where: {
            deviceId: id,
            recorded_at: { [Op.between]: [startTime, latestTime] },
          },
          attributes: ["recorded_at", sensorColumn],
          order: [["recorded_at", "ASC"]],
        });

        const formattedDataPoints = [];
        const dataValues = [];

        let currentIntervalStart = latestTime;
        for (let i = 0; i < 48; i++) {
          const intervalEnd = new Date(currentIntervalStart.getTime() - intervalDuration);
          const intervalData = sensorData.filter(
            data => data.recorded_at >= intervalEnd && data.recorded_at <= currentIntervalStart
          );

          let exactValue = null;
          if (intervalData.length > 0) {
            exactValue = intervalData[intervalData.length - 1][sensorColumn];
            dataValues.push(exactValue);
          }

          formattedDataPoints.push({
            time: currentIntervalStart.toISOString().slice(0, 16).replace("T", " "),
            value: exactValue !== null ? exactValue.toFixed(1) : "N/A",
          });

          currentIntervalStart = intervalEnd;
        }

        if (threshold) {
          if (threshold[thresholdParam.minField] !== null) {
            dataValues.push(threshold[thresholdParam.minField]);
          }
          if (threshold[thresholdParam.maxField] !== null) {
            dataValues.push(threshold[thresholdParam.maxField]);
          }
        }

        dataValues.sort((a, b) => a - b);
        const minParameterValue = dataValues.length > 0 ? dataValues[0] - 1 : null;
        const maxParameterValue = dataValues.length > 0 ? dataValues[dataValues.length - 1] + 1 : null;

        formattedDataPoints.reverse();

        results.push({
          label: `${parameterName} (${parameter ? parameter.unit : ""})`,
          minThresholdValue: threshold ? threshold[thresholdParam.minField] : null,
          maxThresholdValue: threshold ? threshold[thresholdParam.maxField] : null,
          minParameterValue,
          maxParameterValue,
          values: formattedDataPoints,
        });
      } else {
        results.push({
          label: parameterName,
          error: "Parameter not mapped",
          values: [],
        });
      }
    }

    return res.status(200).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "An error occurred while retrieving data",
    });
  }
};

exports.getTimeBasedGraphData = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "Start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (end <= start) {
      return res.status(400).json({
        error: "End date must be after start date",
      });
    }

    const device = await Device.findOne({
      where: { id: id },
      include: { model: Package, as: "package" },
    });

    if (!device) return res.status(404).json({ error: "Device not found" });

    const pkg = device.package;
    if (!pkg)
      return res
        .status(404)
        .json({ error: "Package not found for this device" });

    const parameters = pkg.parameters;
    const results = [];

    for (const parameterName of parameters) {
      const thresholdParam = thresholdMapping[parameterName];
      const sensorColumn = sensorColumnMapping[parameterName];

      if (thresholdParam) {
        const [threshold, parameter] = await Promise.all([
          Threshold.findOne({
            where: { deviceId: id, status: true },
            attributes: [thresholdParam.minField, thresholdParam.maxField],
          }),
          Parameter.findOne({
            where: { parameter: parameterName },
            attributes: ["unit", "min_value", "max_value"],
          }),
        ]);

        const sensorData = await Sensor.findAll({
          where: {
            deviceId: id,
            recorded_at: {
              [Op.between]: [start, end],
            },
          },
          attributes: ["recorded_at", sensorColumn],
          order: [["recorded_at", "ASC"]],
        });

        const filteredDataPoints = [];
        let lastRecordedTime = null;

        sensorData.forEach((data) => {
          const currentTime = new Date(data.recorded_at);

          if (
            !lastRecordedTime ||
            currentTime - lastRecordedTime >= 30 * 60 * 1000
          ) {
            filteredDataPoints.push({
              time: currentTime.toISOString().slice(0, 16).replace("T", " "),
              value: data[sensorColumn] ? data[sensorColumn].toFixed(1) : "N/A",
            });

            lastRecordedTime = currentTime;
          }
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
          values: filteredDataPoints,
        });
      } else {
        results.push({
          label: parameterName,
          error: "Parameter not mapped",
          values: [],
        });
      }
    }

    return res.status(200).json(results);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "An error occurred while retrieving data" });
  }
};
