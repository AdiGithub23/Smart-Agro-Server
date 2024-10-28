const { Farm, Device, User, FarmManager } = require('../models');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');
//const XLSX = require('xlsx');

exports.createFarm = async (req, res) => {
  try {
    const { farm_id, farm_name, farmAddress, farmContactNo, farmEmail, farmDevices, farmManagers } = req.body;
    const newFarm = await Farm.create({ farm_id, farm_name, farmAddress, farmContactNo, farmEmail });
    
    if (farmDevices && farmDevices.length) {
      const devices = await Device.findAll({ where: { id: farmDevices } });
      const assignedDevices = await Device.findAll({ 
        where: {
          id: farmDevices,
          farm_id: {
            [Op.ne]: null 
          }
        }
      });
      if (assignedDevices.length) {
        return res.status(400).json({ error: 'Some devices are already assigned to another farm' });
      }
      await newFarm.setDevices(devices);
      await Device.update({ farm_id: newFarm.id }, { where: { id: farmDevices } });
    }
    if (farmManagers && farmManagers.length) {
      const managers = await User.findAll({ where: { id: farmManagers, user_role: 'customer-manager' } });
      await newFarm.setManagers(managers);
    }
    
    res.status(201).json(newFarm);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
};

// exports.uploadFarms = async (req, res) => {
//   try {
//     if (!req.body) {
//       return res.status(400).json({ error: 'No file data received' });
//     }

//     // Convert the raw file data to a Buffer
//     const buffer = Buffer.from(req.body, 'binary');

//     const workbook = XLSX.read(buffer, { type: 'buffer' });
//     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//     const jsonData = XLSX.utils.sheet_to_json(worksheet);

//     const { userId } = req.params;
//     createdById = userId;

//     for (const row of jsonData) {
//       const { farm_name, farmAddress, farmContactNo, farmEmail, managerIds } = row;

//       // Create the farm record
//       const farm = await Farm.create({ farm_name, farmAddress, farmContactNo, farmEmail, createdById });

//       // Process manager IDs
//       const managerIdsArray = managerIds.split(',').map(id => id.trim());
//       for (const uid of managerIdsArray) {
//         // Extract the numerical part from the UID string
//         const actualManagerId = parseInt(uid.replace('UID', ''), 10);
        
//         if (!isNaN(actualManagerId)) {
//           await FarmManager.create({
//             farm_id: farm.id,
//             userId: actualManagerId,
//           });
//         }
//       }
//     }

//     res.status(200).json({ message: 'Farms and managers added successfully!' });
//   } catch (error) {
//     console.error('Error uploading farms:', error);
//     res.status(500).json({ error: 'Failed to upload farms.' });
//   }
// };

exports.uploadFarms = async (req, res) => {
  try {
    const farmData = req.body;
    const { userId } = req.params;
    createdById = userId;

    for (const item of farmData) {
      const { farm_name, farmAddress, farmContactNo, farmEmail } = item;

      // Check if the farm already exists
      const existingFarm = await Farm.findOne({
        where: {
          farmEmail,
        },
      });

      if (!existingFarm) {
        await Farm.create({ ...item, createdById }); 
      } else {
        return res.status(400).json({
          error: `Farm with email "${farmEmail}" already exists. Skipping creation.`,
        });
      }
    }

    res.status(200).send("Farms uploaded successfully!");
  } catch (error) {
    console.error("Error saving farms:", error);
    res.status(500).send("Failed to upload farms.");
  }
};


// exports.getFarms = async (req, res) => {
//   try {
//     const farms = await Farm.findAll({
//       include: [
//         { model: Device, as: 'devices' },
//         { model: User, as: 'managers' },
//       ],
//     });
//     res.status(200).json(farms);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getFarms = async (req, res) => {
//   try {
//     const farms = await Farm.findAll({
//       include: [
//         {
//           model: Device,
//           as: 'devices',
//           where: Sequelize.where(Sequelize.col('devices.farm_id'), Sequelize.col('Farm.id')), // Ensures farm_id matches Farm.id
//           required: false // Optional join, so farms without devices are still included
//         },
//         {
//           model: User,
//           as: 'managers',
//           where: {
//             [Sequelize.Op.and]: [
//               Sequelize.where(Sequelize.col('managers.company'), Sequelize.col('Farm.farm_name')), // Ensures company matches farm_name
//               { user_role: 'customer-manager' } // Filter by user role
//             ]
//           },
//           required: false // Optional join, so farms without managers are still included
//         }
//       ]
//     });
//     res.status(200).json(farms);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getFarms = async (req, res) => {
  try {
    const farms = await Farm.findAll({
      include: [
        {
          model: Device,
          as: 'devices',
          required: false, 
        },
        {
          model: User,
          as: 'managers',
          through: { model: FarmManager }, 
          required: false, 
        }
      ]
    });

    res.status(200).json(farms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFarmsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const farms = await Farm.findAll({
      where: {
        createdById: userId, 
      },
      include: [
        {
          model: Device,
          as: 'devices',
          required: false, 
        },
        {
          model: User,
          as: 'managers',
          through: { model: FarmManager },
          required: false, 
        }
      ]
    });

    res.status(200).json(farms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const { farm_name, farmAddress, farmContactNo, farmEmail, farmDevices, farmManagers } = req.body;

    const farm = await Farm.findByPk(id);
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    await farm.update({ farm_name, farmAddress, farmContactNo, farmEmail });

    if (farmDevices && farmDevices.length) {
      const devices = await Device.findAll({ where: { id: farmDevices } });
      const assignedDevices = await Device.findAll({ 
        where: {
          id: farmDevices,
          farm_id: {
            [Op.ne]: null 
          }
        }
      });
      if (assignedDevices.length) {
        return res.status(400).json({ error: 'Some devices are already assigned to another farm' });
      }
      await farm.setDevices(devices);
      await Device.update({ farm_id: farm.id }, { where: { id: farmDevices } });
    }    
    if (farmManagers && farmManagers.length) {
      const managers = await User.findAll({ where: { id: farmManagers, user_role: 'customer-manager' } });
      await farm.setManagers(managers);
    }

    res.status(200).json(farm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFarm = async (req, res) => {
  try {
    const { id } = req.params;
    
    const farm = await Farm.findByPk(id);

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    await FarmManager.destroy({ where: { farm_id: id } });

    await farm.destroy();

    res.status(200).json({ message: 'Farm and associated managers deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get farm by ID
exports.getFarmById = async (req, res) => {
  try {
    const { id } = req.params;
    const farm = await Farm.findByPk(id);
    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }
    res.status(200).json(farm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get the count of farms
exports.getFarmCount = async (req, res) => {
  try {
    const farmCount = await Farm.count();
    res.status(200).json({ count: farmCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get the count of farms by managers Id
exports.getManagerFarmCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const farmCount = await FarmManager.count({
      where: {
        userId: userId,
      },
    });

    res.status(200).json({ count: farmCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFarmCountByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const farmCount = await Farm.count({
      where: {
        createdById: userId, 
      }
    });

    res.status(200).json({ count: farmCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};