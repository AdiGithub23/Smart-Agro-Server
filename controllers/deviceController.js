const { Device, DeviceManager, User, Farm, Sensor,FarmManager } = require("../models");
const { Op } = require("sequelize");

// Create a new device
exports.createDevice = async (req, res) => {
  try {
    const deviceData = req.body;

    const existingDevice = await Device.findOne({ where: { serial_no: deviceData.serial_no } });
    if (existingDevice) {
      return res.status(400).json({ error: "Device already exists" });
    }

    const newDevice = await Device.create(deviceData);
    res.status(201).json(newDevice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all devices
exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.findAll({
      include: [
        // { model: User, as: "customers" },
        { model: Farm, as: "farm" }
      ],
      order: [
        ['createdAt', 'DESC']
      ]
    });
    res.status(200).json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  
};

// Get device by ID
exports.getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;
    const device = await Device.findByPk(id, {
      include: [
        { model: User, as: "customer" },
        { model: Farm, as: "farm" }
      ]
    });
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    res.status(200).json(device);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update device
exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const deviceData = req.body;

    const [updated] = await Device.update(deviceData, { where: { id } });
    if (updated) {
      const updatedDevice = await Device.findByPk(id);
      res.status(200).json(updatedDevice);
    } else {
      res.status(404).json({ error: "Device not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete device
exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Device.destroy({ where: { id } });
    if (deleted) {
      res.status(200).json({ message: "Device deleted successfully" });
    } else {
      res.status(404).json({ error: "Device not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get the count of devices
exports.getDeviceCount = async (req, res) => {
  try {
    const deviceCount = await Device.count();
    res.status(200).json({ count: deviceCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get the count of active devices
exports.getActiveDeviceCount = async (req, res) => {
  try {
    const deviceCount = await Device.count({
      where: { active_status: 'Active' } 
    });
    res.status(200).json({ count: deviceCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get the count of devices by customer ID 
exports.getDeviceCountByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;
    const deviceCount = await Device.count({ where: { customer_id: customerId } });
    res.status(200).json({ count: deviceCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get the count of active devices by customer ID
exports.getActiveDeviceCountByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;
    const deviceCount = await Device.count({
      where: {
        customer_id: customerId,
        active_status: 'Active'
      }
    });
    res.status(200).json({ count: deviceCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get devices count by manager ID 
exports.getDeviceCountByManagerId = async (req, res) => {
  try {
    const { managerId } = req.params;

    const deviceCount = await DeviceManager.count({
      where: { 
        manager_id: managerId,
      }
    });

    res.status(200).json({ count: deviceCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get the count of active devices by manager ID
exports.getActiveDeviceCountByManagerId = async (req, res) => {
  try {
    const { managerId } = req.params;

    const activeDeviceCount = await Device.count({
      include: [
        {
          model: DeviceManager,
          as: 'deviceManagers',
          where: { manager_id: managerId }
        }
      ],
      where: { active_status: 'Active' }
    });

    res.status(200).json({ count: activeDeviceCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get devices by customer ID
exports.getDevicesByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;

    const devices = await Device.findAll({
      where: { customer_id: customerId },
      include: {
        model: DeviceManager,
        as: 'deviceManagers', 
        attributes: ['manager_id', 'manager_name'] 
      }
    });

    res.status(200).json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign device to managers
exports.assignDeviceToManagers = async (req, res) => {
  try {
    const { id } = req.params; 
    const { managers } = req.body; 

    // Find the device by ID
    const device = await Device.findByPk(id);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    // Assign each manager to the device and update farm details
    for (let managerData of managers) {
      const { manager_id, manager_name, farm_id, farm_name, longitude, latitude, device_label } = managerData;

      // Ensure the manager exists
      const manager = await User.findByPk(manager_id);
      if (!manager) {
        return res.status(404).json({ error: `Manager with ID ${manager_id} not found` });
      }

      if (manager.user_role !== 'customer-manager') {
        return res.status(403).json({ error: `User with ID ${manager_id} does not have the 'customer-manager' role` });
      }

      // Check the farm assignment validity
        const farm = await Farm.findByPk(farm_id);
        if (!farm) {
          return res.status(404).json({ error: `Farm with ID ${farm_id} not found` });
        }

        if (device.farm_id && device.farm_id !== farm_id) {
          return res.status(400).json({ error: `Device have already assigned to farm ID: ${device.farm_id}` });
        }

      // Check if the manager is already assigned
      const existingAssignment = await DeviceManager.findOne({
        where: {
          device_id: device.id,
          manager_id
        }
      });
      if (existingAssignment) {
        return res.status(400).json({ error: `Manager with ID ${manager_id} is already assigned to this device` });
      }

      // Create a new DeviceManager record
      await DeviceManager.create({
        device_id: id,
        manager_id,
        manager_name: manager.full_name,
      });

      // Update the device with the farm details
      await device.update({
        farm_id,
        farm_name: farm.farm_name,
        longitude,
        latitude,
        device_label
      });

      const existingFarmManager = await FarmManager.findOne({
        where: {
          farm_id,
          userId: manager_id,
        }
      });

      // create a new FarmManager record
      if (!existingFarmManager) {
        await FarmManager.create({
          farm_id,
          userId: manager_id,
        });
      }
    }

    res.status(201).json({ message: "Device assigned to managers successfully", device });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Delete an assigned manager
exports.deleteAssignedManager = async (req, res) => {
  try {
    const { deviceId, managerId } = req.params;

    // Find the DeviceManager record
    const deviceManager = await DeviceManager.findOne({
      where: { device_id: deviceId, manager_id: managerId }
    });

    if (!deviceManager) {
      return res.status(404).json({ error: "DeviceManager record not found" });
    }

    // Ensure the manager exists
    const manager = await User.findByPk(managerId);
    if (!manager) {
      return res.status(404).json({ error: `Manager with ID ${managerId} not found` });
    }

    // Delete the DeviceManager record
    await DeviceManager.destroy({
      where: { device_id: deviceId, manager_id: managerId }
    });

    // Update the Device record
    const device = await Device.findByPk(deviceId);
    if (device) {
      
      const remainingManagers = await DeviceManager.findAll({
        where: { device_id: deviceId }
      });

      if (remainingManagers.length === 0) {
        await device.update({
          
          farm_id: null,
          farm_name: null,
        });
      }
    }

    res.status(200).json({ message: "Manager removed from device successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update assigned device manager 
exports.updateDeviceManager = async (req, res) => {
  try {
    const { deviceId, managerId } = req.params;
    const { manager_name, farm_id, farm_name } = req.body;

    // Find the DeviceManager record
    const deviceManager = await DeviceManager.findOne({
      where: { device_id: deviceId, manager_id: managerId }
    });

    if (!deviceManager) {
      return res.status(404).json({ error: "DeviceManager record not found" });
    }

    // Ensure the manager exists
    const manager = await User.findByPk(managerId);
    if (!manager) {
      return res.status(404).json({ error: `Manager with ID ${managerId} not found` });
    }

    if (manager.user_role !== 'customer-manager') {
      return res.status(403).json({ error: `User with ID ${managerId} does not have the 'customer-manager' role` });
    }

    // Validate farm ID
    if (farm_id) {
      const farm = await Farm.findByPk(farm_id);
      if (!farm) {
        return res.status(404).json({ error: `Farm with ID ${farm_id} not found` });
      }
    }

    // Update the DeviceManager record
    await deviceManager.update({
      manager_name,
      farm_id,
      farm_name
    });

    res.status(200).json({ message: "DeviceManager updated successfully", deviceManager });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get all devices with their location
exports.getDevicesWithLocation = async (req, res) => {
  try {
    const devices = await Device.findAll({
      attributes: ['id', 'serial_no', 'model_name', 'company_name', 'longitude', 'latitude', 'device_label'], 
      where: {
        longitude: { [Op.ne]: null }, 
        latitude: { [Op.ne]: null }   
      },
      include: [
        {
          model: Sensor,
          as: 'sensors',
          attributes: [
            'Air_Temperature',
            'Relative_Air_Humidity',
            'Rainfall',
            'Soil_Temperature',
            'Soil_Moisture',
            'Soil_pH',
            'Soil_EC',
            'Soil_Nitrogen',
            'Soil_Phosphorous',
            'Soil_Potassium',
            'recorded_at',
          ],
          order: [['recorded_at', 'DESC']], // Get the latest record
          limit: 1, // Limit to the latest record only
        },
      ],
    });

    res.status(200).json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get all device locations by customer_id
exports.getDeviceLocationsByCustomerId = async (req, res) => {
  try {
    const { customer_id } = req.params;

    const devices = await Device.findAll({
      attributes: [
        'id', 
        'serial_no', 
        'model_name', 
        'company_name', 
        'longitude', 
        'latitude', 
        'device_label'
      ], 
      where: {
        customer_id,  // Filter by customer_id
        longitude: { [Op.ne]: null }, 
        latitude: { [Op.ne]: null }   
      },
      include: [
        {
          model: Sensor,
          as: 'sensors',
          attributes: [
            'Air_Temperature',
            'Relative_Air_Humidity',
            'Rainfall',
            'Soil_Temperature',
            'Soil_Moisture',
            'Soil_pH',
            'Soil_EC',
            'Soil_Nitrogen',
            'Soil_Phosphorous',
            'Soil_Potassium',
            'recorded_at',
          ],
          order: [['recorded_at', 'DESC']], // Get the latest record
          limit: 1, // Limit to the latest record only
        },
      ],
    });

    res.status(200).json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all device locations by manager_id
exports.getDeviceLocationsByManagerId = async (req, res) => {
  const { manager_id } = req.params;

  try {
    const devices = await Device.findAll({
      attributes: ['id', 'serial_no', 'model_name', 'company_name', 'longitude', 'latitude', 'device_label'],
      where: {
        longitude: { [Op.ne]: null },
        latitude: { [Op.ne]: null },
      },
      include: [
        {
          model: DeviceManager,
          as: 'deviceManagers',
          where: {
            manager_id: manager_id,
          },
          attributes: [], 
        },
        {
          model: Sensor,
          as: 'sensors',
          attributes: [
            'Air_Temperature',
            'Relative_Air_Humidity',
            'Rainfall',
            'Soil_Temperature',
            'Soil_Moisture',
            'Soil_pH',
            'Soil_EC',
            'Soil_Nitrogen',
            'Soil_Phosphorous',
            'Soil_Potassium',
            'recorded_at',
          ],
          order: [['recorded_at', 'DESC']], // Get the latest record
          limit: 1, // Limit to the latest record only
        },
      ],
    });

    res.status(200).json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getDevicesByCustomerAdminID = async (req, res) => {
  try {
    const { customer_id } = req.params;

    if (!customer_id) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    const devices = await Device.findAll({
      where: { customer_id: customer_id },
      attributes: ["id", "active_status", "serial_no", "model_name","device_label"],
    });

    res.status(200).json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};