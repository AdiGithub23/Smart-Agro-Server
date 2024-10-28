const { DeviceManager, Device, User,Farm } = require("../models");

// Create a new device-manager relation
exports.createDeviceManager = async (req, res) => {
  try {
    const { device_id, manager_id, manager_name } = req.body;

    // Check if the device-manager relation already exists
    const existingRelation = await DeviceManager.findOne({
      where: { device_id, manager_id }
    });

    if (existingRelation) {
      return res.status(400).json({ error: "Device-Manager relation already exists" });
    }

    // Create new relation if it doesn't exist
    const newDeviceManager = await DeviceManager.create({ device_id, manager_id, manager_name });
    res.status(201).json(newDeviceManager);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all device-manager relations
exports.getAllDeviceManagers = async (req, res) => {
  try {
    const deviceManagers = await DeviceManager.findAll({
      include: [
        { model: Device, as: "device" },
        { model: User, as: "manager" }
      ]
    });
    res.status(200).json(deviceManagers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get device-manager relation by ID
exports.getDeviceManagerById = async (req, res) => {
  try {
    const { id } = req.params;
    const deviceManager = await DeviceManager.findByPk(id, {
      include: [
        { model: Device, as: "device" },
        { model: User, as: "manager" }
      ]
    });
    if (!deviceManager) {
      return res.status(404).json({ error: "Device-Manager relation not found" });
    }
    res.status(200).json(deviceManager);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update device-manager relation
exports.updateDeviceManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { device_id, manager_id, manager_name } = req.body;

    const [updated] = await DeviceManager.update({ device_id, manager_id, manager_name }, { where: { id } });
    if (updated) {
      const updatedDeviceManager = await DeviceManager.findByPk(id);
      res.status(200).json(updatedDeviceManager);
    } else {
      res.status(404).json({ error: "Device-Manager relation not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete device-manager relation
exports.deleteDeviceManager = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DeviceManager.destroy({ where: { id } });
    if (deleted) {
      res.status(200).json({ message: "Device-Manager relation deleted successfully" });
    } else {
      res.status(404).json({ error: "Device-Manager relation not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// // Get devices by manager ID
// exports.getDevicesByManagerId = async (req, res) => {
//   try {
//     const { managerId } = req.params;

//     const deviceManagers = await DeviceManager.findAll({
//       where: { manager_id: managerId },
//       include: [
//         { model: Device, as: "device" } 
//       ]
//     });

//     const devices = deviceManagers.map(deviceManager => deviceManager.device);

//     res.status(200).json(devices);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Get devices by manager ID
exports.getDevicesByManagerId = async (req, res) => {
  try {
    const { managerId } = req.params;

    const deviceManagers = await DeviceManager.findAll({
      where: { manager_id: managerId },
      logging: console.log
    });

    console.log("Device Managers:", deviceManagers);

    const deviceIds = deviceManagers.map(deviceManager => deviceManager.device_id);

    console.log("Device IDs:", deviceIds);

    const devices = await Device.findAll({
      where: { id: deviceIds },
      logging: console.log
    });

    console.log("Devices:", devices);

    if (devices.length === 0) {
      return res.status(404).json({ message: "No devices found for this manager." });
    }

    res.status(200).json(devices);
  } catch (err) {
    console.error("Error fetching devices by manager ID:", err);
    res.status(500).json({ error: "An error occurred while fetching devices. Please try again later." });
  }
};
