const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authorizeSltOrCustomOrManager } = require('../middleware/authorize');

router.post("/add", authorizeSltOrCustomOrManager, notificationController.addNotifications); // No use for now
router.get("/", authorizeSltOrCustomOrManager, notificationController.getNotifications);

router.get('/customer/:customer_id', notificationController.getNotificationsByCustomer);
router.get('/manager/:manager_id', notificationController.getNotificationsByManager);

router.get('/receiver/:receiverId', notificationController.getNotificationsByReceiverId);

router.get('/alerts/count/:userId', notificationController.getUnreadAlertsCount);
router.get('/messages/count/:userId', notificationController.getUnreadMessagesCount);
//router.get('/device/:deviceId', notificationController.getNotificationsByDeviceId);
router.get('/device/:deviceId/receiver/:receiverId', notificationController.getNotificationsByDeviceIdAndReceiverId);
router.put('/read/:receiverId/:notificationId', notificationController.updateAlertisRead);
router.put('/message-read/:receiverId/:notificationId', notificationController.updateMessageisRead);


module.exports = router;
