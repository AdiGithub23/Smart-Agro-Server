const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
// const { authorizeRole } = require('../middleware/authorize');

// Routes for inventory
router.post("/", inventoryController.uploadInventory);
router.get("/", inventoryController.getAllInventoryItems);
router.post("/assign/:id", inventoryController.assignInventoryToCustomer);
router.get("/:id", inventoryController.getInventoryItemById);
router.put("/:id", inventoryController.updateInventoryItem);

// Route to update assigned customer
router.put('/devices/:id', inventoryController.updateDevice);

router.delete("/:id", inventoryController.deleteInventoryItem);
router.delete("/assign/:id", inventoryController.deleteAssignedCustomer);


module.exports = router;
