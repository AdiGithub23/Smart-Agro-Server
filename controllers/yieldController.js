const { Yield } = require("../models");
const { Op } = require("sequelize");
const { parse } = require("json2csv");

async function createYield(req, res) {
  const { device_id } = req.params;

  if (!device_id) {
    return res.status(400).json({ error: "Device ID required" });
  }

  try {
    const { crop_name, quantity, unit_price, date, time } = req.body;

    if (!crop_name || !quantity || !unit_price || !date || !time) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const total = quantity * unit_price;

    const newYield = await Yield.create({
      deviceId: device_id,
      crop_name,
      quantity,
      unit_price,
      total,
      date,
      time,
    });

    return res.status(201).json(newYield);
  } catch (error) {
    console.error("Error creating yield:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteYield(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Yield.destroy({ where: { id } });
    if (deleted) {
      res.status(200).json({ message: "Yield data deleted successfully" });
    } else {
      res.status(404).json({ error: "Yield not found" });
    }
  } catch (error) {
    console.error("Error deleting yield:", error);
    res.status(500).json({ error: error.message });
  }
}

async function graphYieldData(req, res) {
  try {
    const { device_id } = req.params;

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (end <= start) {
      return res
        .status(400)
        .json({ error: "End date must be after start date" });
    }

    const latestYields = await Yield.findAll({
      where: {
        deviceId: device_id,
        date: {
          [Op.between]: [start, end],
        },
      },
      order: [["date", "ASC"]],
    });

    res.status(200).json(latestYields);
  } catch (err) {
    console.error("Error fetching yield data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function tileYieldData(req, res) {
  try {
    const { device_id } = req.params;

    const latestYields = await Yield.findAll({
      where: {
        deviceId: device_id,
      },
      // limit: 5,
      order: [
        ["date", "DESC"],
        ["time", "DESC"]  
      ],
      attributes: [
        "id",
        "crop_name",
        "quantity",
        "unit_price",
        "total",
        "date",
        "time",
      ],
    });

    res.status(200).json(latestYields);
  } catch (err) {
    console.error("Error fetching yield data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function editYield(req, res) {
  try {
    const { id } = req.params;
    const { deviceId, crop_name, quantity, unit_price, date, time } = req.body;

    if (!crop_name || !quantity || !unit_price || !date || !time) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!id) {
      return res.status(400).json({ error: "Yield ID is required" });
    }

    const existingYield = await Yield.findByPk(id);
    if (!existingYield) {
      return res.status(404).json({ error: "Yield not found" });
    }

    if (deviceId) existingYield.deviceId = deviceId;
    if (crop_name) existingYield.crop_name = crop_name;

    if (quantity !== undefined) {
      existingYield.quantity = quantity;
      existingYield.total = quantity * (existingYield.unit_price || unit_price);
    }

    if (unit_price !== undefined) {
      existingYield.unit_price = unit_price;
      existingYield.total = (existingYield.quantity || quantity) * unit_price;
    }

    if (date) existingYield.date = date;
    if (time) existingYield.time = time;

    await existingYield.save();

    return res.status(200).json(existingYield);
  } catch (error) {
    console.error("Error updating yield:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function downloadableData(req, res) {
  try {
    const { device_id } = req.params;
    const { startDate, endDate, download } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (end <= start) {
      return res.status(400).json({ error: "End date must be after start date" });
    }

    const latestYields = await Yield.findAll({
      where: {
        deviceId: device_id,
        date: {
          [Op.between]: [start, end],
        },
      },
      order: [["date", "ASC"]],
    });

    const latestYieldsArray = latestYields.map(yield => yield.toJSON());

    if (download === "true") {
      const csv = parse(latestYieldsArray);

      res.header("Content-Type", "text/csv");
      res.attachment("yield-data.csv");
      res.send(csv);
    } else {
      res.status(200).json(latestYieldsArray);
    }
  } catch (err) {
    console.error("Error fetching yield data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createYield,
  deleteYield,
  graphYieldData,
  tileYieldData,
  editYield,
  downloadableData,
};
