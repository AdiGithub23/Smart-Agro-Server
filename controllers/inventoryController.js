const { Inventory, Device, User, DeviceManager, Package, Dashboard } = require("../models");

// // Create a new inventory item
// exports.createInventoryItem = async (req, res) => {
//   try {
//     const inventoryItem = req.body;

//     const existingItem = await Inventory.findOne({ where: { serial_no: inventoryItem.serial_no } });
//     if (existingItem) {
//       return res.status(400).json({ error: "Inventory item already exists" });
//     }

//     const newInventoryItem = await Inventory.create(inventoryItem);
//     res.status(201).json(newInventoryItem);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.uploadInventory = async (req, res) => {
  try {
    const inventoryData = req.body;

    for (const item of inventoryData) {
      if (item.secret_code && (item.secret_code.length > 10 || item.secret_code.length < 5)) {
        return res.status(400).json({ error: `Secret code should be a maximum of 10 characters, and minimum of 5 characters` });
      }

      const numericPackageId = item.package_id.replace(/\D/g, '');

      const packageExists = await Package.findOne({ where: { id: numericPackageId } });
      if (!packageExists) {
        return res.status(400).json({ error: `Invalid package_id: ${item.package_id}. Package does not exist.` });
      }

      const serialNoExists = await Inventory.findOne({ where: { serial_no: item.serial_no } });
      if (serialNoExists) {
        return res.status(400).json({ error: `Serial number ${item.serial_no} already exists.` });
      }

      item.package_id = numericPackageId;

      await Inventory.create(item);
    }

    res.status(200).send("Inventory uploaded successfully!");
  } catch (error) {
    console.error("Error saving inventory:", error);
    res.status(500).send("Failed to upload inventory.");
  }
};

// Get all inventory items
exports.getAllInventoryItems = async (req, res) => {
  try {
    const inventoryItems = await Inventory.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(inventoryItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  
};

// Assign inventory to customer
exports.assignInventoryToCustomer = async (req, res) => {
  try {
    const { id } = req.params; 
    const {
      customer_id,
      customer_name,
      company_name,
      latitude,
      longitude,
      assigned_SLT_admin,
      farm_id,
    } = req.body; 

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: "Latitude and Longitude must be valid numbers" });
    }    

    // Find the inventory item by ID
    const inventoryItem = await Inventory.findByPk(id);
    if (!inventoryItem) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    // Check if the inventory item is already assigned
    if (inventoryItem.status === "Assigned") {
      return res.status(400).json({ error: "Inventory item is already assigned to a device" });
    }

    // Ensure the customer exists 
    const customer = await User.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({ error: `Customer with ID ${customer_id} not found` });
    }

    if (customer.user_role !== 'customer-admin') {
      return res.status(403).json({ error: `User with ID ${customer_id} does not have the 'customer-admin' role` });
    }

    // Create a new device 
    const newDevice = await Device.create({
      inventoryId: inventoryItem.id,
      serial_no: inventoryItem.serial_no,
      model_name: inventoryItem.model_name,
      package_id: inventoryItem.package_id,
      secret_code: inventoryItem.secret_code,
      device_type: inventoryItem.device_type,
      customer_id,
      customer_name: customer.full_name,
      company_name: customer.company,
      latitude,
      longitude,
      assigned_SLT_admin,
      farm_id
    });

    await newDevice.update({ device_label: `Device ${newDevice.id}` });

    // Update the status
    await inventoryItem.update({ status: "Assigned" });

    res.status(201).json(newDevice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get inventory item by ID
exports.getInventoryItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const inventoryItem = await Inventory.findByPk(id);
    if (!inventoryItem) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    res.status(200).json(inventoryItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update inventory item
// exports.updateInventoryItem = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { serial_no, ...otherFields } = req.body;

//     // Update the inventory item
//     const [updated] = await Inventory.update({ serial_no, ...otherFields }, { where: { id } });

//     if (updated) {
//       const updatedInventoryItem = await Inventory.findByPk(id);

//       // If the inventory item is assigned update details
//       if (updatedInventoryItem.status === 'Assigned') {
//         await Device.update(
//           {
//             serial_no: updatedInventoryItem.serial_no,
//             model_name: updatedInventoryItem.model_name,
//             package_id: updatedInventoryItem.package_id,
//             secret_code: updatedInventoryItem.secret_code,
//             device_type: updatedInventoryItem.device_type,
//           },
//           { where: { inventoryId: id } }
//         );
//       }

//       res.status(200).json(updatedInventoryItem);
//     } else {
//       res.status(404).json({ error: "Inventory item not found" });
//     }
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { package_id } = req.body;

    if (!package_id) {
      return res.status(400).json({ error: "Package ID is required" });
    }

    const inventoryItem = await Inventory.findByPk(id);
    if (!inventoryItem) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    if (inventoryItem.package_id === package_id) {
      return res.status(400).json({ error: "Same package selected again" });
    }

    await Inventory.update(
      { package_id },
      { where: { id } }
    );

    if (inventoryItem.status === "Assigned") {
      const device = await Device.findOne({
        where: { inventoryId: id }
      });

      if (!device) {
        return res.status(404).json({ error: "Device associated with inventory not found" });
      }

      await Device.update(
        { package_id },
        { where: { inventoryId: id } }
      );
    }

    return res.status(200).json({
      message: "Package ID updated successfully."
    });
  } catch (err) {
    console.error("Error updating package ID:", err);
    return res.status(500).json({ error: "An error occurred while updating package ID" });
  }
};

// Delete inventory item
exports.deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Inventory.destroy({ where: { id } });
    if (deleted) {
      res.status(200).json({ message: "Inventory item deleted successfully" });
    } else {
      res.status(404).json({ error: "Inventory item not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete an assigned customer
exports.deleteAssignedCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the device by ID
    const device = await Device.findByPk(id);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    // Remove associated DeviceManager records
    await DeviceManager.destroy({
      where: { device_id: id }
    });

    // Remove associated dashboard records
    await Dashboard.destroy({
      where: { device_id: id }
    });

    // Remove the device from Inventory
    await Inventory.update({ status: 'In Stock' }, {
      where: { id: device.inventoryId }
    });

    // Delete the device record
    await Device.destroy({
      where: { id }
    });

    res.status(200).json({ message: "Device and its associations deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update assigned customer
exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      serial_no,
      model_name,
      package_id,
      secret_code,
      device_type,
      customer_id,
      customer_name,
      company_name,
      latitude,
      longitude,
      assigned_SLT_admin,
      farm_id,
      farm_name
    } = req.body;

    // Find the device by ID
    const device = await Device.findByPk(id);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    // Validate customer ID
    if (customer_id) {
      const customer = await User.findByPk(customer_id);
      if (!customer || customer.user_role !== 'customer-admin') {
        return res.status(403).json({ error: `User with ID ${customer_id} does not have the 'customer-admin' role` });
      }
    }

    // Validate farm ID
    if (farm_id) {
      const farm = await Farm.findByPk(farm_id);
      if (!farm) {
        return res.status(404).json({ error: `Farm with ID ${farm_id} not found` });
      }
    }

    // Update the device
    await device.update({
      serial_no,
      model_name,
      package_id,
      secret_code,
      device_type,
      customer_id,
      customer_name,
      company_name,
      latitude,
      longitude,
      assigned_SLT_admin,
      farm_id,
      farm_name
    });

    res.status(200).json({ message: "Device updated successfully", device });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// // Assign an inventory item to a customer and create a device record
// exports.assignInventoryToCustomer = async (req, res) => {
//   try {
//     const { id } = req.params; // inventoryId from the request params
//     const { customerId, latitude, longitude } = req.body; // customerId, latitude, and longitude from the request body

//     // Find the inventory item by its ID
//     const inventory = await Inventory.findByPk(id);
//     if (!inventory) {
//       return res.status(404).json({ error: "Inventory not found" });
//     }

//     // Find the customer by their ID
//     const customer = await User.findByPk(customerId);
//     if (!customer || customer.user_role !== "customer-admin") {
//       return res.status(400).json({
//         error: "Invalid customer ID or the user is not a customer-admin",
//       });
//     }
    
//     // Update the inventory item's assigned status to true
//     await Inventory.update({ status: 'assigned' }, { where: { id } });

//     // Extract relevant data from the inventory and customer
//     const { serial_no, model_name, package, secret_code, device_type } = inventory;
//     const { full_name: customer_name, company: company_name } = customer;

//     // Create a new device record with the inventory and customer data
//     const device = await Device.create({
//       inventoryId: id,
//       serial_no,
//       model_name,
//       package,
//       secret_code,
//       device_type,
//       latitude,
//       longitude,
//       customer_id: customerId,
//       customer_name,
//       company_name,
//       assigned_SLT_admin: "ssss", // Placeholder, replace with actual logic if needed
//     });

//     // Return the newly created device record
//     res.status(201).json(device);
//   } catch (err) {
//     console.error("Error assigning inventory to customer:", err);
//     res.status(500).json({ error: "Error assigning inventory to customer" });
//   }
// };