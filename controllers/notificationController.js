const { Sensor, Threshold, Notification, Device, DeviceManager, User, NotificationReceiver } = require("../models");
const { Op } = require('sequelize');

// New Notification - (never used for now)
exports.addNotifications = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming you have user ID in the token

    // Fetch new messages for the logged-in user
    const token = req.headers.authorization.split(" ")[1];
    const response = await axios.get(`/api/messages/lastmessages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const messages = response.data;
    console.log(userId)

    // Save the fetched messages to the Notifications table
    const notifications = await Promise.all(
      messages.map((message) =>
        Notification.create({
          deviceId: message.deviceId, // Assuming each message has a deviceId
          notificationType: "Message", // Or another type if appropriate
          notificationTitle: "New Message Received", // Customizable title
          message: message.content, // The actual message content
          isRead: false,
          createdAt: message.timestamp, // Use the timestamp from the message
          receiverId: userId,
        })
      )
    );

    return res.status(201).json({ success: true, notifications });
  } catch (error) {
    console.error("Failed to add notifications:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// Fetch notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  console.log('getNotifications triggered !!!')
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    console.log('user obtained: ', user)

    // Fetch notifications for the logged-in user
    const notifications = await Notification.findAll({
      where: { receiverId: user.id },
      order: [["createdAt", "DESC"]],
      limit: 5
    });

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// create a notification
const createNotification = async (deviceId, type, title, message) => {
  await Notification.create({
    deviceId,
    notificationType: type,
    notificationTitle: title,
    message,
  });
};
// generate notifications
exports.checkSensorValues = async (deviceId) => {
  try {
      const sensors = await Sensor.findOne({ where: { deviceId } });
      const threshold = await Threshold.findOne({ where: { deviceId } });

      sensors.forEach(async (sensor) => {
          if (threshold) {
        // Check Air Temperature
        if (sensor.Air_Temperature < threshold.min_AirTemperature) {
          createNotification(sensor.deviceId, 'Temperature', 'Low Air Temperature Alert', 
            `The Air Temperature sensor has detected a temperature of ${sensor.Air_Temperature}°C, which is below the minimum threshold of ${threshold.min_AirTemperature}°C.`);
        }
        if (sensor.Air_Temperature > threshold.max_AirTemperature) {
          createNotification(sensor.deviceId, 'Temperature', 'High Air Temperature Alert', 
            `The Air Temperature sensor has detected a temperature of ${sensor.Air_Temperature}°C, which is above the maximum threshold of ${threshold.max_AirTemperature}°C.`);
        }
        
        // Check Relative Air Humidity
        if (sensor.Relative_Air_Humidity < threshold.min_RelativeAirHumidity) {
          createNotification(sensor.deviceId, 'Humidity', 'Low Relative Air Humidity Alert', 
            `The Relative Air Humidity sensor has recorded a humidity level of ${sensor.Relative_Air_Humidity}%, which is below the minimum threshold of ${threshold.min_RelativeAirHumidity}%.`);
        }
        if (sensor.Relative_Air_Humidity > threshold.max_RelativeAirHumidity) {
          createNotification(sensor.deviceId, 'Humidity', 'High Relative Air Humidity Alert', 
            `The Relative Air Humidity sensor has recorded a humidity level of ${sensor.Relative_Air_Humidity}%, which is above the maximum threshold of ${threshold.max_RelativeAirHumidity}%.`);
        }
        
        // Check Rainfall
        if (sensor.Rainfall < threshold.min_Rainfall) {
          createNotification(sensor.deviceId, 'Rainfall', 'Low Rainfall Alert', 
            `The Rainfall sensor has detected a rainfall of ${sensor.Rainfall}mm, which is below the minimum threshold of ${threshold.min_Rainfall}mm.`);
        }
        if (sensor.Rainfall > threshold.max_Rainfall) {
          createNotification(sensor.deviceId, 'Rainfall', 'High Rainfall Alert', 
            `The Rainfall sensor has detected a rainfall of ${sensor.Rainfall}mm, which is above the maximum threshold of ${threshold.max_Rainfall}mm.`);
        }

        // Check Soil Temperature
        if (sensor.Soil_Temperature < threshold.min_SoilTemperature) {
          createNotification(sensor.deviceId, 'Soil Temperature', 'Low Soil Temperature Alert', 
            `The Soil Temperature sensor has recorded a temperature of ${sensor.Soil_Temperature}°C, which is below the minimum threshold of ${threshold.min_SoilTemperature}°C.`);
        }
        if (sensor.Soil_Temperature > threshold.max_SoilTemperature) {
          createNotification(sensor.deviceId, 'Soil Temperature', 'High Soil Temperature Alert', 
            `The Soil Temperature sensor has recorded a temperature of ${sensor.Soil_Temperature}°C, which is above the maximum threshold of ${threshold.max_SoilTemperature}°C.`);
        }

        // Check Soil Moisture
        if (sensor.Soil_Moisture < threshold.min_SoilMoisture) {
          createNotification(sensor.deviceId, 'Soil Moisture', 'Low Soil Moisture Alert', 
            `The Soil Moisture sensor has recorded a moisture level of ${sensor.Soil_Moisture}%, which is below the minimum threshold of ${threshold.min_SoilMoisture}%.`);
        }
        if (sensor.Soil_Moisture > threshold.max_SoilMoisture) {
          createNotification(sensor.deviceId, 'Soil Moisture', 'High Soil Moisture Alert', 
            `The Soil Moisture sensor has recorded a moisture level of ${sensor.Soil_Moisture}%, which is above the maximum threshold of ${threshold.max_SoilMoisture}%.`);
        }

        // Check Soil pH
        if (sensor.Soil_pH < threshold.min_SoilPH) {
          createNotification(sensor.deviceId, 'Soil pH', 'Low Soil pH Alert', 
            `The Soil pH sensor has recorded a pH level of ${sensor.Soil_pH}, which is below the minimum threshold of ${threshold.min_SoilPH}.`);
        }
        if (sensor.Soil_pH > threshold.max_SoilPH) {
          createNotification(sensor.deviceId, 'Soil pH', 'High Soil pH Alert', 
            `The Soil pH sensor has recorded a pH level of ${sensor.Soil_pH}, which is above the maximum threshold of ${threshold.max_SoilPH}.`);
        }

        // Check Soil EC
        if (sensor.Soil_EC < threshold.min_SoilEC) {
          createNotification(sensor.deviceId, 'Soil EC', 'Low Soil EC Alert', 
            `The Soil EC sensor has recorded an electrical conductivity of ${sensor.Soil_EC} dS/m, which is below the minimum threshold of ${threshold.min_SoilEC} dS/m.`);
        }
        if (sensor.Soil_EC > threshold.max_SoilEC) {
          createNotification(sensor.deviceId, 'Soil EC', 'High Soil EC Alert', 
            `The Soil EC sensor has recorded an electrical conductivity of ${sensor.Soil_EC} dS/m, which is above the maximum threshold of ${threshold.max_SoilEC} dS/m.`);
        }

        // Check Soil Nitrogen
        if (sensor.Soil_Nitrogen < threshold.min_SoilNitrogen) {
          createNotification(sensor.deviceId, 'Soil Nitrogen', 'Low Soil Nitrogen Alert', 
            `The Soil Nitrogen sensor has recorded a nitrogen level of ${sensor.Soil_Nitrogen} ppm, which is below the minimum threshold of ${threshold.min_SoilNitrogen} ppm.`);
        }
        if (sensor.Soil_Nitrogen > threshold.max_SoilNitrogen) {
          createNotification(sensor.deviceId, 'Soil Nitrogen', 'High Soil Nitrogen Alert', 
            `The Soil Nitrogen sensor has recorded a nitrogen level of ${sensor.Soil_Nitrogen} ppm, which is above the maximum threshold of ${threshold.max_SoilNitrogen} ppm.`);
        }

        // Check Soil Phosphorous
        if (sensor.Soil_Phosphorous < threshold.min_SoilPhosphorous) {
          createNotification(sensor.deviceId, 'Soil Phosphorous', 'Low Soil Phosphorous Alert', 
            `The Soil Phosphorous sensor has recorded a phosphorous level of ${sensor.Soil_Phosphorous} ppm, which is below the minimum threshold of ${threshold.min_SoilPhosphorous} ppm.`);
        }
        if (sensor.Soil_Phosphorous > threshold.max_SoilPhosphorous) {
          createNotification(sensor.deviceId, 'Soil Phosphorous', 'High Soil Phosphorous Alert', 
            `The Soil Phosphorous sensor has recorded a phosphorous level of ${sensor.Soil_Phosphorous} ppm, which is above the maximum threshold of ${threshold.min_SoilPhosphorous} ppm.`);
        }

        // Check Soil Potassium
        if (sensor.Soil_Potassium < threshold.min_SoilPotassium) {
          createNotification(sensor.deviceId, 'Soil Potassium', 'Low Soil Potassium Alert', 
            `The Soil Potassium sensor has recorded a potassium level of ${sensor.Soil_Potassium} ppm, which is below the minimum threshold of ${threshold.min_SoilPotassium} ppm.`);
        }
        if (sensor.Soil_Potassium > threshold.max_SoilPotassium) {
          createNotification(sensor.deviceId, 'Soil Potassium', 'High Soil Potassium Alert', 
            `The Soil Potassium sensor has recorded a potassium level of ${sensor.Soil_Potassium} ppm, which is above the maximum threshold of ${threshold.min_SoilPotassium} ppm.`);
        }
      }
    });

    return { message: 'Sensor values checked and notifications generated where necessary.' };
  } catch (error) {
    console.error('Error checking sensor values:', error.message);
    return { error: error.message };
  }
};

// retrieve notifications for a customer
exports.getNotificationsByCustomer = async (req, res) => {
  try {
    const { customer_id } = req.params;

    const devices = await Device.findAll({
      where: { customer_id },
      attributes: ['id'], 
    });

    const deviceIds = devices.map(device => device.id);

    const notifications = await Notification.findAll({
      where: {
        deviceId: deviceIds,
      },
      include: [
        {
          model: Device,
          as: 'device',
          attributes: ['serial_no', 'model_name'], 
        },
      ],
    });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// retrieve notifications for a manager
exports.getNotificationsByManager = async (req, res) => {
    try {
      const { manager_id } = req.params;
  
      const devices = await DeviceManager.findAll({
        where: { manager_id },
        attributes: ['device_id'], 
      });
  
      const deviceIds = devices.map(deviceManager => deviceManager.device_id);
  
      const notifications = await Notification.findAll({
        where: {
          deviceId: deviceIds,
        },
        include: [
          {
            model: Device,
            as: 'device',
            attributes: ['serial_no', 'model_name'], 
          },
        ],
      });
  
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};


exports.getNotificationsByReceiverId = async (req, res) => {
  try {
    const { receiverId } = req.params;

    const notifications = await NotificationReceiver.findAll({
      where: { 
        receiverId,
        createdAt: {
          [Op.gte]: new Date(new Date() - 48 * 60 * 60 * 1000) // 48 hours ago
        } 
      },
      include: [{
        model: Notification,
        as: 'notification',
        attributes: ['id', 'notificationType', 'notificationTitle', 'message', 'createdAt']
      }]
    });

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ message: 'No notifications found for the given receiverId.' });
    }

    const result = notifications.map(nr => {
      if (nr.notification) {
        return {
          id: nr.notification.id,
          notificationType: nr.notification.notificationType,
          notificationTitle: nr.notification.notificationTitle,
          message: nr.notification.message,
          createdAt: nr.notification.createdAt,
          isRead: nr.isRead
        };
      } else {
        return null;  
      }
    }).filter(nr => nr !== null); 

    return res.json(result);

  } catch (error) {
    console.error('Error fetching notifications by receiverId:', error);
    return res.status(500).json({ error: 'An error occurred while fetching notifications.' });
  }
};

// exports.getNotificationsByDeviceId = async (req, res) => {
//   try {
//     const { deviceId } = req.params;

//     const notifications = await NotificationReceiver.findAll({
//       include: [{
//         model: Notification,
//         as: 'notification',
//         attributes: ['notificationType', 'notificationTitle', 'message', 'createdAt'],
//         where: { deviceId } 
//       }]
//     });

//     if (!notifications || notifications.length === 0) {
//       return res.status(404).json({ message: 'No notifications found for the given deviceId.' });
//     }

//     const result = notifications.map(nr => {
//       if (nr.notification) {
//         return {
//           notificationType: nr.notification.notificationType,
//           notificationTitle: nr.notification.notificationTitle,
//           message: nr.notification.message,
//           createdAt: nr.notification.createdAt,
//           isRead: nr.isRead
//         };
//       } else {
//         return null;
//       }
//     }).filter(nr => nr !== null);

//     return res.json(result);

//   } catch (error) {
//     console.error('Error fetching notifications by deviceId:', error);
//     return res.status(500).json({ error: 'An error occurred while fetching notifications.' });
//   }
// };

exports.getNotificationsByDeviceIdAndReceiverId = async (req, res) => {
  try {
    const { deviceId, receiverId } = req.params;

    const notifications = await NotificationReceiver.findAll({
      where: { 
        receiverId,
        createdAt: {
          [Op.gte]: new Date(new Date() - 48 * 60 * 60 * 1000) // 48 hours ago
        } 
      },
      include: [{
        model: Notification,
        as: 'notification',
        attributes: ['id', 'notificationType', 'notificationTitle', 'message', 'createdAt'],
        where: { deviceId }
      }]
    });

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ message: 'No notifications found for the given deviceId and receiverId.' });
    }

    const result = notifications.map(nr => {
      if (nr.notification) {
        return {
          id: nr.notification.id,
          notificationType: nr.notification.notificationType,
          notificationTitle: nr.notification.notificationTitle,
          message: nr.notification.message,
          createdAt: nr.notification.createdAt,
          isRead: nr.isRead
        };
      } else {
        return null;
      }
    }).filter(nr => nr !== null);  

    return res.json(result);

  } catch (error) {
    console.error('Error fetching notifications by deviceId and receiverId:', error);
    return res.status(500).json({ error: 'An error occurred while fetching notifications.' });
  }
};

// Mark alert notification as read
exports.updateAlertisRead = async (req, res) => {
  try {
    const { receiverId, notificationId } = req.params;

    const [updated] = await NotificationReceiver.update(
      { isRead: true }, 
      {
        where: {
          notificationId: notificationId,
          receiverId: receiverId,
        },
      }
    );

    if (updated) {
      const updatedNotification = await NotificationReceiver.findByPk(notificationId);
      res.status(200).json(updatedNotification);
    } else {
      res.status(404).json({ error: "Notification or receiver not found" });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};


// Mark message notification as read
exports.updateMessageisRead = async (req, res) => {
  try {
    const { receiverId, notificationId } = req.params;

    const [updated] = await Notification.update(
      { isRead: true }, 
      {
        where: {
          id: notificationId,
          receiverId: receiverId,
        },
      }
    );

    if (updated) {
      const updatedNotification = await Notification.findByPk(notificationId);
      res.status(200).json(updatedNotification);
    } else {
      res.status(404).json({ error: "Notification or receiver not found" });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUnreadAlertsCount = async (req, res) => {
  try {
    const { userId } = req.params;  

    const unreadCount = await NotificationReceiver.count({
      where: {
        receiverId: userId,
        isRead: false,
        createdAt: {
          [Op.gte]: new Date(new Date() - 48 * 60 * 60 * 1000) // 48 hours ago
        }
      },
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching unread alerts count:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUnreadMessagesCount = async (req, res) => {
  try {
    const { userId } = req.params;  

    const unreadCount = await Notification.count({
      where: {
        receiverId: userId,
        isRead: false,
        createdAt: {
          [Op.gte]: new Date(new Date() - 48 * 60 * 60 * 1000) // 48 hours ago
        }
      },
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching unread messages count:", error);
    res.status(500).json({ error: error.message });
  }
};


