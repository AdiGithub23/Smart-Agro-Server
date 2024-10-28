const { sendSms } = require('./sms.js');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

let lastProcessed = new Date(0); // Start from the epoch

const getLastProcessedTime = async () => {
  return lastProcessed;
};

const updateLastProcessedTime = async () => {
  lastProcessed = new Date();
};

// let lastSmsSentTimes = {}; // To track the last SMS sent time for each device

// const getLastSmsSentTime = (deviceId) => {
//   return lastSmsSentTimes[deviceId] || new Date(0); // Default to epoch if no previous SMS sent
// };

// const updateLastSmsSentTime = (deviceId) => {
//   lastSmsSentTimes[deviceId] = new Date();
// };

let lastSmsSentByDevice = {};

const getLastSmsSentTime = (deviceId, notificationTitle) => {
  const key = `${deviceId}_${notificationTitle}`;
  return lastSmsSentByDevice[key] || new Date(0); // Default to epoch time if not set
};

const updateLastSmsSentTime = (deviceId, notificationTitle) => {
  const key = `${deviceId}_${notificationTitle}`;
  lastSmsSentByDevice[key] = new Date();
};

const sendSmsWithCooldown = (managers, customer, sltadmins, message, deviceId, notificationTitle) => {
  const lastSentTime = getLastSmsSentTime(deviceId, notificationTitle);
  const now = new Date();

  // Check if 2 hours have passed since the last SMS for this device and title
  if (now - lastSentTime >= 2 * 60 * 60 * 1000) {
    // Send the SMS
    sendSms(managers, customer, sltadmins, message);

    // Update the last SMS sent time for this device and notification title
    updateLastSmsSentTime(deviceId, notificationTitle);
  } else {
    console.log(`SMS not sent for device ${deviceId} - ${notificationTitle}: within 2-hour window.`);
  }
};

const handleSensorThresholds = async (sensor) => {
    const threshold = await sequelize.models.Threshold.findOne({
      where: { 
        deviceId: sensor.deviceId,
        status: true,
       }
    });    

    // const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

    // // Check if we sent an SMS in the last 2 hours
    // const lastSmsTime = getLastSmsSentTime(sensor.deviceId);
    // if (lastSmsTime > twoHoursAgo) {
    //   console.log(`SMS already sent for device ${sensor.deviceId} within the last 2 hours. Skipping SMS.`);
    //   return; // Don't send another SMS
    // }

    const managers = await sequelize.models.DeviceManager.findAll({
      where: { device_id: sensor.deviceId },
      include: [{
        model: sequelize.models.User,
        as: 'manager', 
        attributes: ['phone_number'] 
      }]
    });

    const customer = await sequelize.models.Device.findOne({
      where: { id: sensor.deviceId },
      include: [{
        model: sequelize.models.User,
        as: 'customer', 
        attributes: ['phone_number'] 
      }]
    });

    const sltadmins = await sequelize.models.User.findAll({
      where: { user_role: 'slt-admin' }
    });

    const createNotification = async (deviceId, title, message) => {
      try {
        const notification = await sequelize.models.Notification.create({
          deviceId,
          notificationType: 'Real-time Alert',
          notificationTitle: title,
          message,
          isRead: null
        });

      // Create NotificationReceiver records for all managers
      for (const manager of managers) {
        await sequelize.models.NotificationReceiver.create({
          notificationId: notification.id,
          receiverId: manager.manager_id, 
        });
      }

      // Create NotificationReceiver record for the customer
      if (customer && customer.customer_id) {
        await sequelize.models.NotificationReceiver.create({
          notificationId: notification.id,
          receiverId: customer.customer_id, 
        });
      }

      // Create NotificationReceiver records for all SLT Admins
      for (const sltadmin of sltadmins) {
        await sequelize.models.NotificationReceiver.create({
          notificationId: notification.id,
          receiverId: sltadmin.id,
        });
      }

      // setTimeout(() => {
      //   sendEmailToSmsGateway(managers, customer, sltadmins, title, message);
      // }, 1.2 * 60 * 60 * 1000); // 2 hours in milliseconds
      //sendEmailToSmsGateway(managers, customer, sltadmins, title, message);

      scheduleViolationCheck(deviceId, title);

      
    } catch (error) {
      console.error('Error creating notification or receivers:', error.message);
    }
  }

  const scheduleViolationCheck = async (deviceId, notificationTitle) => {
    setTimeout(async () => {
      await checkViolationStatus(deviceId, notificationTitle);
    }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
  };

  const checkViolationStatus = async (deviceId, notificationTitle) => {
    const violationTwoHoursAgo = new Date(Date.now() - (2 * 60 * 60 * 1000));

    // Get notifications for this device created in the last 2 hours
    const recentNotifications = await sequelize.models.Notification.findAll({
      where: {
        deviceId,
        notificationType: 'Real-time Alert',
        createdAt: { [Op.gte]: violationTwoHoursAgo }
      }
    });

    // If no new notifications, get the most recent notification message and recipient list
    if (recentNotifications.length === 0) {
      const lastNotification = await sequelize.models.Notification.findOne({
        where: {
          deviceId,
          notificationType: 'Real-time Alert'
        },
        order: [['createdAt', 'DESC']]
      });

      if (lastNotification) {
        //sendSms(managers, customer, sltadmins, lastNotification.message, lastNotification.notificationTitle);

        // sendSms(managers, customer, sltadmins, lastNotification.message);
        // updateLastSmsSentTime(deviceId); // Update the last SMS sent time after sending
        sendSmsWithCooldown(managers, customer, sltadmins, lastNotification.message, deviceId, lastNotification.notificationTitle);
      } else {
        console.log(`No notification found for device ${deviceId}.`);
      }
      return;
    }

    // If new notifications are created, check for matching titles
    const matchingTitle = recentNotifications.find(n => n.notificationTitle === notificationTitle);

    if (matchingTitle) {
      // sendSms(managers, customer, sltadmins, matchingTitle.message);
      // updateLastSmsSentTime(deviceId); // Update the last SMS sent time after sending

      sendSmsWithCooldown(managers, customer, sltadmins, matchingTitle.message, deviceId, matchingTitle.notificationTitle);
    } else {
      // Violation settled
      console.log(`Violation for device ${deviceId} has been settled.`);
    }
  };

    if (threshold) {
      try {
        // Check Air Temperature
        if (threshold.min_AirTemperature) {
          if (sensor.Air_Temperature < threshold.min_AirTemperature) {
            createNotification(sensor.deviceId, 'Low Air Temperature Alert', 
              `The Air Temperature sensor of Device ${sensor.deviceId} has detected a temperature of ${sensor.Air_Temperature}°C, which is below the minimum threshold of ${threshold.min_AirTemperature}°C.`);
          }
        }
        if (threshold.max_AirTemperature) {
          if (sensor.Air_Temperature > threshold.max_AirTemperature) {
            createNotification(sensor.deviceId, 'High Air Temperature Alert', 
              `The Air Temperature sensor of Device ${sensor.deviceId} has detected a temperature of ${sensor.Air_Temperature}°C, which is above the maximum threshold of ${threshold.max_AirTemperature}°C.`);
          }
        }
        
        // Check Relative Air Humidity
        if (threshold.min_RelativeAirHumidity) {
          if (sensor.Relative_Air_Humidity < threshold.min_RelativeAirHumidity) {
            createNotification(sensor.deviceId, 'Low Relative Air Humidity Alert', 
              `The Relative Air Humidity sensor of Device ${sensor.deviceId} has recorded a humidity level of ${sensor.Relative_Air_Humidity}%, which is below the minimum threshold of ${threshold.min_RelativeAirHumidity}%.`);
          }
        }
        if (threshold.max_RelativeAirHumidity) {
          if (sensor.Relative_Air_Humidity > threshold.max_RelativeAirHumidity) {
            createNotification(sensor.deviceId, 'High Relative Air Humidity Alert', 
              `The Relative Air Humidity sensor of Device ${sensor.deviceId} has recorded a humidity level of ${sensor.Relative_Air_Humidity}%, which is above the maximum threshold of ${threshold.max_RelativeAirHumidity}%.`);
          }
        }
        
        // Check Rainfall
        if (threshold.min_Rainfall) {
          if (sensor.Rainfall < threshold.min_Rainfall) {
            createNotification(sensor.deviceId, 'Low Rainfall Alert', 
              `The Rainfall sensor of Device ${sensor.deviceId} has detected a rainfall of ${sensor.Rainfall}mm, which is below the minimum threshold of ${threshold.min_Rainfall}mm.`);
          }
        }
        if (threshold.max_Rainfall) {
          if (sensor.Rainfall > threshold.max_Rainfall) {
            createNotification(sensor.deviceId, 'High Rainfall Alert', 
              `The Rainfall sensor of Device ${sensor.deviceId} has detected a rainfall of ${sensor.Rainfall}mm, which is above the maximum threshold of ${threshold.max_Rainfall}mm.`);
          }
        }

        // Check Soil Temperature
        if (threshold.min_SoilTemperature) {
          if (sensor.Soil_Temperature < threshold.min_SoilTemperature) {
            createNotification(sensor.deviceId, 'Low Soil Temperature Alert', 
              `The Soil Temperature sensor of Device ${sensor.deviceId} has recorded a temperature of ${sensor.Soil_Temperature}°C, which is below the minimum threshold of ${threshold.min_SoilTemperature}°C.`);
          }
        }
        if (threshold.max_SoilTemperature) {
          if (sensor.Soil_Temperature > threshold.max_SoilTemperature) {
            createNotification(sensor.deviceId, 'High Soil Temperature Alert', 
              `The Soil Temperature sensor of Device ${sensor.deviceId} has recorded a temperature of ${sensor.Soil_Temperature}°C, which is above the maximum threshold of ${threshold.max_SoilTemperature}°C.`);
          }
        }

        // Check Soil Moisture
        if (threshold.min_SoilMoisture) {
          if (sensor.Soil_Moisture < threshold.min_SoilMoisture) {
            createNotification(sensor.deviceId, 'Low Soil Moisture Alert', 
              `The Soil Moisture sensor of Device ${sensor.deviceId} has recorded a moisture level of ${sensor.Soil_Moisture}%, which is below the minimum threshold of ${threshold.min_SoilMoisture}%.`);
          }
        }
        if (threshold.max_SoilMoisture) {
          if (sensor.Soil_Moisture > threshold.max_SoilMoisture) {
            createNotification(sensor.deviceId, 'High Soil Moisture Alert', 
              `The Soil Moisture sensor of Device ${sensor.deviceId} has recorded a moisture level of ${sensor.Soil_Moisture}%, which is above the maximum threshold of ${threshold.max_SoilMoisture}%.`);
          }
        }

        // Check Soil pH
        if (threshold.min_SoilpH) {
          if (sensor.Soil_pH < threshold.min_SoilpH) {
            createNotification(sensor.deviceId, 'Low Soil pH Alert', 
              `The Soil pH sensor of Device ${sensor.deviceId} has recorded a pH level of ${sensor.Soil_pH}, which is below the minimum threshold of ${threshold.min_SoilpH}.`);
          }
        }
        if (threshold.max_SoilpH) {
          if (sensor.Soil_pH > threshold.max_SoilpH) {
            createNotification(sensor.deviceId, 'High Soil pH Alert', 
              `The Soil pH sensor of Device ${sensor.deviceId} has recorded a pH level of ${sensor.Soil_pH}, which is above the maximum threshold of ${threshold.max_SoilpH}.`);
          }
        }

        // Check Soil EC
        if (threshold.min_SoilEC) {
          if (sensor.Soil_EC < threshold.min_SoilEC) {
            createNotification(sensor.deviceId, 'Low Soil EC Alert', 
              `The Soil EC sensor of Device ${sensor.deviceId} has recorded an electrical conductivity of ${sensor.Soil_EC} µS/cm, which is below the minimum threshold of ${threshold.min_SoilEC} µS/cm.`);
          }
        }
        if (threshold.max_SoilEC) {
          if (sensor.Soil_EC > threshold.max_SoilEC) {
            createNotification(sensor.deviceId, 'High Soil EC Alert', 
              `The Soil EC sensor of Device ${sensor.deviceId} has recorded an electrical conductivity of ${sensor.Soil_EC} µS/cm, which is above the maximum threshold of ${threshold.max_SoilEC} µS/cm.`);
          }
        }

        // Check Soil Nitrogen
        if (threshold.min_SoilNitrogen) {
          if (sensor.Soil_Nitrogen < threshold.min_SoilNitrogen) {
            createNotification(sensor.deviceId, 'Low Soil Nitrogen Alert', 
              `The Soil Nitrogen sensor of Device ${sensor.deviceId} has recorded a nitrogen level of ${sensor.Soil_Nitrogen} ppm, which is below the minimum threshold of ${threshold.min_SoilNitrogen} ppm.`);
          }
        }
        if (threshold.max_SoilNitrogen) {
          if (sensor.Soil_Nitrogen > threshold.max_SoilNitrogen) {
            createNotification(sensor.deviceId, 'High Soil Nitrogen Alert', 
              `The Soil Nitrogen sensor of Device ${sensor.deviceId} has recorded a nitrogen level of ${sensor.Soil_Nitrogen} ppm, which is above the maximum threshold of ${threshold.max_SoilNitrogen} ppm.`);
          }
        }

        // Check Soil Phosphorous
        if (threshold.min_SoilPhosphorous) {
          if (sensor.Soil_Phosphorous < threshold.min_SoilPhosphorous) {
            createNotification(sensor.deviceId, 'Low Soil Phosphorous Alert', 
              `The Soil Phosphorous sensor of Device ${sensor.deviceId} has recorded a phosphorous level of ${sensor.Soil_Phosphorous} ppm, which is below the minimum threshold of ${threshold.min_SoilPhosphorous} ppm.`);
          }
        }
        if (threshold.max_SoilPhosphorous) {
          if (sensor.Soil_Phosphorous > threshold.max_SoilPhosphorous) {
            createNotification(sensor.deviceId, 'High Soil Phosphorous Alert', 
              `The Soil Phosphorous sensor of Device ${sensor.deviceId} has recorded a phosphorous level of ${sensor.Soil_Phosphorous} ppm, which is above the maximum threshold of ${threshold.min_SoilPhosphorous} ppm.`);
          }
        }

        // Check Soil Potassium
        if (threshold.min_SoilPotassium) {
          if (sensor.Soil_Potassium < threshold.min_SoilPotassium) {
            createNotification(sensor.deviceId, 'Low Soil Potassium Alert', 
              `The Soil Potassium sensor of Device ${sensor.deviceId} has recorded a potassium level of ${sensor.Soil_Potassium} ppm, which is below the minimum threshold of ${threshold.min_SoilPotassium} ppm.`);
          }
        }
        if (threshold.max_SoilPotassium) {
          if (sensor.Soil_Potassium > threshold.max_SoilPotassium) {
            createNotification(sensor.deviceId, 'High Soil Potassium Alert', 
              `The Soil Potassium sensor of Device ${sensor.deviceId} has recorded a potassium level of ${sensor.Soil_Potassium} ppm, which is above the maximum threshold of ${threshold.min_SoilPotassium} ppm.`);
          }
        }

        return { message: 'Sensor values checked and notifications generated where necessary.' };
      } catch (error) {
        console.error('Error checking sensor values:', error.message);
        return { error: error.message };
      }
    }
  }

  const handleSensorParameters = async (sensor) => {

    const parameters = await sequelize.models.Parameter.findAll();

    const managers = await sequelize.models.DeviceManager.findAll({
      where: { device_id: sensor.deviceId },
      include: [{
        model: sequelize.models.User,
        as: 'manager', 
        attributes: ['phone_number'] 
      }]
    });

    const customer = await sequelize.models.Device.findOne({
      where: { id: sensor.deviceId },
      include: [{
        model: sequelize.models.User,
        as: 'customer', 
        attributes: ['phone_number'] 
      }]
    });

    const sltadmins = await sequelize.models.User.findAll({
      where: { user_role: 'slt-admin' }
    });

    const createNotification = async (deviceId, title, message) => {
      try {
        const notification = await sequelize.models.Notification.create({
          deviceId,
          notificationType: 'Parameter Alert',
          notificationTitle: title,
          message,
          isRead: null
        });

      // Create NotificationReceiver records for all managers
      for (const manager of managers) {
        await sequelize.models.NotificationReceiver.create({
          notificationId: notification.id,
          receiverId: manager.manager_id, 
        });
      }

      // Create NotificationReceiver record for the customer
      if (customer && customer.customer_id) {
        await sequelize.models.NotificationReceiver.create({
          notificationId: notification.id,
          receiverId: customer.customer_id, 
        });
      }

      // Create NotificationReceiver records for all SLT Admins
      for (const sltadmin of sltadmins) {
        await sequelize.models.NotificationReceiver.create({
          notificationId: notification.id,
          receiverId: sltadmin.id,
        });
      }

      // setTimeout(() => {
      //   sendEmailToSmsGateway(managers, customer, sltadmins, title, message);
      // }, 1.2 * 60 * 60 * 1000); // 2 hours in milliseconds
      sendSms(managers, customer, sltadmins, message);

      
    } catch (error) {
      console.error('Error creating notification or receivers:', error.message);
    }
  }

    if(parameters){
    try{
      parameters.forEach((parameter) => {
        const { parameter: paramName, unit, min_value, max_value } = parameter;

        if (paramName=='Air Temperature'){
          if (sensor.Air_Temperature < min_value) {
            createNotification(sensor.deviceId, 'Low Air Temperature Parameter Alert', 
              `The Air Temperature sensor of Device ${sensor.deviceId} has recorded a temperature level of ${sensor.Air_Temperature} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
          }
          if (sensor.Air_Temperature > max_value) {
            createNotification(sensor.deviceId,  'High Air Temperature Parameter Alert', 
              `The Air Temperature sensor of Device ${sensor.deviceId} has recorded a temperature level of ${sensor.Air_Temperature} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
          }
        }
        if (paramName=='Relative Air Humidity'){
          if (sensor.Relative_Air_Humidity < min_value) {
            createNotification(sensor.deviceId, 'Low Relative Air Humidity Parameter Alert', 
              `The Relative Air Humidity sensor of Device ${sensor.deviceId} has recorded a humidity level of ${sensor.Relative_Air_Humidity} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
          }
          if (sensor.Relative_Air_Humidity > max_value) {
            createNotification(sensor.deviceId, 'High Air Temperature Parameter Alert', 
              `The Relative Air Humidity sensor of Device ${sensor.deviceId} has recorded a humidity level of ${sensor.Relative_Air_Humidity} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
          }
        }
        if (paramName=='Rainfall'){
          if (sensor.Rainfall < min_value) {
            createNotification(sensor.deviceId, 'Low Rainfall Parameter Alert', 
              `The Rainfall sensor of Device ${sensor.deviceId} has recorded a rainfall level of ${sensor.Rainfall} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
          }
          if (sensor.Rainfall > max_value) {
            createNotification(sensor.deviceId, 'High Rainfall Parameter Alert', 
              `The Rainfall sensor of Device ${sensor.deviceId} has recorded a rainfall level of ${sensor.Rainfall} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
          }
        }
        if (paramName=='Soil Temperature'){
          if (sensor.Soil_Temperature < min_value) {
            createNotification(sensor.deviceId, 'Low Soil Temperature Parameter Alert', 
              `The Soil Temperature sensor of Device ${sensor.deviceId} has recorded a temperature level of ${sensor.Soil_Temperature} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
          }
          if (sensor.Soil_Temperature > max_value) {
            createNotification(sensor.deviceId, 'High Soil Temperature Parameter Alert', 
              `The Soil Temperature sensor of Device ${sensor.deviceId} has recorded a temperature level of ${sensor.Soil_Temperature} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
          }
        }
        if (paramName=='Soil Moisture'){
          if (sensor.Soil_Temperature < min_value) {
            createNotification(sensor.deviceId, 'Low Soil Temperature Parameter Alert', 
              `The Soil Temperature sensor of Device ${sensor.deviceId} has recorded a temperature level of ${sensor.Soil_Temperature} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
          }
          if (sensor.Soil_Temperature > max_value) {
            createNotification(sensor.deviceId, 'High Soil Temperature Parameter Alert', 
              `The Soil Temperature sensor of Device ${sensor.deviceId} has recorded a temperature level of ${sensor.Soil_Temperature} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
          }
        }
        if (paramName=='Soil pH'){
          if (sensor.Soil_pH < min_value) {
            createNotification(sensor.deviceId, 'Low Soil pH Parameter Alert', 
              `The Soil pH sensor of Device ${sensor.deviceId} has recorded a pH level of ${sensor.Soil_pH} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
          }
          if (sensor.Soil_pH > max_value) {
            createNotification(sensor.deviceId, 'High Soil pH Parameter Alert', 
              `The Soil pH sensor of Device ${sensor.deviceId} has recorded a pH level of ${sensor.Soil_pH} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
          }
        }
        if (paramName=='Soil EC'){
          if (sensor.Soil_EC < min_value) {
            createNotification(sensor.deviceId, 'Low Soil EC Parameter Alert', 
              `The Soil EC sensor of Device ${sensor.deviceId} has recorded a EC level of ${sensor.Soil_EC} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
          }
          if (sensor.Soil_EC > max_value) {
            createNotification(sensor.deviceId, 'High Soil EC Parameter Alert', 
              `The Soil EC sensor of Device ${sensor.deviceId} has recorded a EC level of ${sensor.Soil_EC} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
          }
        }
        if (paramName=='Soil Nitrogen'){
          if (sensor.Soil_Nitrogen < min_value) {
            createNotification(sensor.deviceId, 'Low Soil Nitrogen Parameter Alert', 
              `The Soil Nitrogen sensor of Device ${sensor.deviceId} has recorded a Nitrogen level of ${sensor.Soil_Nitrogen} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
          }
          if (sensor.Soil_Nitrogen > max_value) {
            createNotification(sensor.deviceId, 'High Soil Nitrogen Parameter Alert', 
              `The Soil Nitrogen sensor of Device ${sensor.deviceId} has recorded a Nitrogen level of ${sensor.Soil_Nitrogen} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
          }
        }
        if (paramName=='Soil Potassium'){
          if (sensor.Soil_Potassium < min_value) {
            createNotification(sensor.deviceId, 'Low Soil Potassium Parameter Alert', 
              `The Soil Potassium sensor of Device ${sensor.deviceId} has recorded a Nitrogen level of ${sensor.Soil_Potassium} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
          }
          if (sensor.Soil_Potassium > max_value) {
            createNotification(sensor.deviceId, 'High Soil Potassium Parameter Alert', 
              `The Soil Potassium sensor of Device ${sensor.deviceId} has recorded a Potassium level of ${sensor.Soil_Potassium} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
          }
        }
        if (paramName=='Soil Phosphorous'){
          if (sensor.Soil_Phosphorous < min_value) {
            createNotification(sensor.deviceId, 'Low Soil Phosphorous Parameter Alert', 
              `The Soil Phosphorous sensor of Device ${sensor.deviceId} has recorded a Phosphorous level of ${sensor.Soil_Phosphorous} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
          }
          if (sensor.Soil_Phosphorous > max_value) {
            createNotification(sensor.deviceId, 'High Soil Phosphorous Parameter Alert', 
              `The Soil Phosphorous sensor of Device ${sensor.deviceId} has recorded a Phosphorous level of ${sensor.Soil_Phosphorous} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
          }
      }
    });
  } catch (error) {
    console.error('Error checking parameters:', error.message);
  }
    }
}

const handleAnalyseThresholds = async (analyse) => {
    const threshold = await sequelize.models.Threshold.findOne({
      where: { deviceId: analyse.deviceId }
    });

    const managers = await sequelize.models.DeviceManager.findAll({
      where: { device_id: analyse.deviceId },
      include: [{
        model: sequelize.models.User,
        as: 'manager', 
        attributes: ['phone_number'] 
      }]
    });

    const customer = await sequelize.models.Device.findOne({
      where: { id: analyse.deviceId },
      include: [{
        model: sequelize.models.User,
        as: 'customer', 
        attributes: ['phone_number'] 
      }]
    });

    const sltadmins = await sequelize.models.User.findAll({
      where: { user_role: 'slt-admin' }
    });

    const createNotification = async (deviceId, title, message) => {
      try {
        const notification = await sequelize.models.Notification.create({
          deviceId,
          notificationType: "Analyse Alert",
          notificationTitle: title,
          message,
          isRead: null
        });
        
      // Create NotificationReceiver records for all managers
      for (const manager of managers) {
        await sequelize.models.NotificationReceiver.create({
          notificationId: notification.id,
          receiverId: manager.manager_id, 
        });
      }

      // Create NotificationReceiver record for the customer
      if (customer && customer.customer_id) {
        await sequelize.models.NotificationReceiver.create({
          notificationId: notification.id,
          receiverId: customer.customer_id, 
        });
      }

      // Create NotificationReceiver records for all SLT Admins
      for (const sltadmin of sltadmins) {
        await sequelize.models.NotificationReceiver.create({
          notificationId: notification.id,
          receiverId: sltadmin.id,
        });
      }

      // setTimeout(() => {
      //   sendEmailToSmsGateway(managers, customer, sltadmins, title, message);
      // }, 1.2 * 60 * 60 * 1000); // 2 hours in milliseconds
      
      //sendEmailToSmsGateway(managers, customer, sltadmins, title, message);

       // Schedule a task to check the violation status after 2 hours
      scheduleViolationCheck(deviceId, title);


    } catch (error) {
      console.error('Error creating notification or receivers:', error.message);
    }
    }

    const scheduleViolationCheck = async (deviceId, notificationTitle) => {
      setTimeout(async () => {
        await checkViolationStatus(deviceId, notificationTitle);
      }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
    };
  
    const checkViolationStatus = async (deviceId, notificationTitle) => {
      const twoHoursAgo = new Date(Date.now() - (2 * 60 * 60 * 1000));
  
      // Get notifications for this device created in the last 2 hours
      const recentNotifications = await sequelize.models.Notification.findAll({
        where: {
          deviceId,
          notificationType: 'Analyse Alert',
          createdAt: { [Op.gte]: twoHoursAgo }
        }
      });
  
      // If no new notifications, get the most recent notification message and recipient list
      if (recentNotifications.length === 0) {
        const lastNotification = await sequelize.models.Notification.findOne({
          where: {
            deviceId,
            notificationType: 'Analyse Alert'
          },
          order: [['createdAt', 'DESC']]
        });
  
        if (lastNotification) {
          //sendSms(managers, customer, sltadmins, lastNotification.message, lastNotification.notificationTitle);
          // sendSms(managers, customer, sltadmins, lastNotification.message);
          sendSmsWithCooldown(managers, customer, sltadmins, lastNotification.message, deviceId, lastNotification.notificationTitle);
        } else {
          console.log(`No notification found for device ${deviceId}.`);
        }
        return;
      }
  
      // If new notifications are created, check for matching titles
      const matchingTitle = recentNotifications.find(n => n.notificationTitle === notificationTitle);
  
      if (matchingTitle) {
        // sendSms(managers, customer, sltadmins, matchingTitle.message);
        sendSmsWithCooldown(managers, customer, sltadmins, matchingTitle.message, deviceId, matchingTitle.notificationTitle);
      } else {
        // Violation settled
        console.log(`Violation for device ${deviceId} has been settled.`);
      }
    };

    if (threshold) {
      try {
        // Check Air Temperature
        if (threshold.min_AirTemperature) {
          if (analyse.Air_Temperature < threshold.min_AirTemperature) {
            createNotification(analyse.deviceId, 'Low Analyse Air Temperature Alert', 
              `The Air Temperature analyse of Device ${analyse.deviceId} has detected a temperature of ${analyse.Air_Temperature}°C, which is below the minimum threshold of ${threshold.min_AirTemperature}°C.`);
          }
        }
        if (threshold.max_AirTemperature) {
          if (analyse.Air_Temperature > threshold.max_AirTemperature) {
            createNotification(analyse.deviceId, 'High Analyse Air Temperature Alert', 
              `The Air Temperature analyse of Device ${analyse.deviceId} has detected a temperature of ${analyse.Air_Temperature}°C, which is above the maximum threshold of ${threshold.max_AirTemperature}°C.`);
          }
        }
        
        // Check Relative Air Humidity
        if (threshold.min_RelativeAirHumidity) {
          if (analyse.Relative_Air_Humidity < threshold.min_RelativeAirHumidity) {
            createNotification(analyse.deviceId, 'Low Analyse Relative Air Humidity Alert', 
              `The Relative Air Humidity analyse of Device ${analyse.deviceId} has recorded a humidity level of ${analyse.Relative_Air_Humidity}%, which is below the minimum threshold of ${threshold.min_RelativeAirHumidity}%.`);
          }
        }
        if (threshold.max_RelativeAirHumidity) {
          if (analyse.Relative_Air_Humidity > threshold.max_RelativeAirHumidity) {
            createNotification(analyse.deviceId, 'High Analyse Relative Air Humidity Alert', 
              `The Relative Air Humidity analyse of Device ${analyse.deviceId} has recorded a humidity level of ${analyse.Relative_Air_Humidity}%, which is above the maximum threshold of ${threshold.max_RelativeAirHumidity}%.`);
          }
        }
        
        // Check Rainfall
        if (threshold.min_Rainfall) {
          if (analyse.Rainfall < threshold.min_Rainfall) {
            createNotification(analyse.deviceId, 'Low Analyse Rainfall Alert', 
              `The Rainfall analyse of Device ${analyse.deviceId} has detected a rainfall of ${analyse.Rainfall}mm, which is below the minimum threshold of ${threshold.min_Rainfall}mm.`);
          }
        }
        if (threshold.max_Rainfall) {
          if (analyse.Rainfall > threshold.max_Rainfall) {
            createNotification(analyse.deviceId, 'High Analyse Rainfall Alert', 
              `The Rainfall analyse of Device ${analyse.deviceId} has detected a rainfall of ${analyse.Rainfall}mm, which is above the maximum threshold of ${threshold.max_Rainfall}mm.`);
          }
        }

        // Check Soil Temperature
        if (threshold.min_SoilTemperature) {
          if (analyse.Soil_Temperature < threshold.min_SoilTemperature) {
            createNotification(analyse.deviceId, 'Low Analyse Soil Temperature Alert', 
              `The Soil Temperature analyse of Device ${analyse.deviceId} has recorded a temperature of ${analyse.Soil_Temperature}°C, which is below the minimum threshold of ${threshold.min_SoilTemperature}°C.`);
          }
        }
        if (threshold.max_SoilTemperature) {
          if (analyse.Soil_Temperature > threshold.max_SoilTemperature) {
            createNotification(analyse.deviceId, 'High Analyse Soil Temperature Alert', 
              `The Soil Temperature analyse of Device ${analyse.deviceId} has recorded a temperature of ${analyse.Soil_Temperature}°C, which is above the maximum threshold of ${threshold.max_SoilTemperature}°C.`);
          }
        }

        // Check Soil Moisture
        if (threshold.min_SoilMoisture) {
          if (analyse.Soil_Moisture < threshold.min_SoilMoisture) {
            createNotification(analyse.deviceId, 'Low Analyse Soil Moisture Alert', 
              `The Soil Moisture analyse of Device ${analyse.deviceId} has recorded a moisture level of ${analyse.Soil_Moisture}%, which is below the minimum threshold of ${threshold.min_SoilMoisture}%.`);
          }
        }
        if (threshold.max_SoilMoisture) {
          if (analyse.Soil_Moisture > threshold.max_SoilMoisture) {
            createNotification(analyse.deviceId, 'High Analyse Soil Moisture Alert', 
              `The Soil Moisture analyse of Device ${analyse.deviceId} has recorded a moisture level of ${analyse.Soil_Moisture}%, which is above the maximum threshold of ${threshold.max_SoilMoisture}%.`);
          }
        }

        // Check Soil pH
        if (threshold.min_SoilpH) {
          if (analyse.Soil_pH < threshold.min_SoilpH) {
            createNotification(analyse.deviceId, 'Low Analyse Soil pH Alert', 
              `The Soil pH analyse of Device ${analyse.deviceId} has recorded a pH level of ${analyse.Soil_pH}, which is below the minimum threshold of ${threshold.min_SoilpH}.`);
          }
        }
        if (threshold.max_SoilpH) {
          if (analyse.Soil_pH > threshold.max_SoilpH) {
            createNotification(analyse.deviceId, 'High Analyse Soil pH Alert', 
              `The Soil pH analyse of Device ${analyse.deviceId} has recorded a pH level of ${analyse.Soil_pH}, which is above the maximum threshold of ${threshold.max_SoilpH}.`);
          }
        }

        // Check Soil EC
        if (threshold.min_SoilEC) {
          if (analyse.Soil_EC < threshold.min_SoilEC) {
            createNotification(analyse.deviceId, 'Low Analyse Soil EC Alert', 
              `The Soil EC analyse of Device ${analyse.deviceId} has recorded an electrical conductivity of ${analyse.Soil_EC} µS/cm, which is below the minimum threshold of ${threshold.min_SoilEC} µS/cm.`);
          }
        }
        if (threshold.max_SoilEC) {
          if (analyse.Soil_EC > threshold.max_SoilEC) {
            createNotification(analyse.deviceId, 'High Analyse Soil EC Alert', 
              `The Soil EC analyse of Device ${analyse.deviceId} has recorded an electrical conductivity of ${analyse.Soil_EC} µS/cm, which is above the maximum threshold of ${threshold.max_SoilEC} µS/cm.`);
          }
        }

        // Check Soil Nitrogen
        if (threshold.min_SoilNitrogen) {
          if (analyse.Soil_Nitrogen < threshold.min_SoilNitrogen) {
            createNotification(analyse.deviceId,'Low Analyse Soil Nitrogen Alert', 
              `The Soil Nitrogen analyse of Device ${analyse.deviceId} has recorded a nitrogen level of ${analyse.Soil_Nitrogen} ppm, which is below the minimum threshold of ${threshold.min_SoilNitrogen} ppm.`);
          }
        }
        if (threshold.max_SoilNitrogen) {
          if (analyse.Soil_Nitrogen > threshold.max_SoilNitrogen) {
            createNotification(analyse.deviceId, 'High Analyse Soil Nitrogen Alert', 
              `The Soil Nitrogen analyse of Device ${analyse.deviceId} has recorded a nitrogen level of ${analyse.Soil_Nitrogen} ppm, which is above the maximum threshold of ${threshold.max_SoilNitrogen} ppm.`);
          }
        }

        // Check Soil Phosphorous
        if (threshold.min_SoilPhosphorous) {
          if (analyse.Soil_Phosphorous < threshold.min_SoilPhosphorous) {
            createNotification(analyse.deviceId, 'Low Analyse Soil Phosphorous Alert', 
              `The Soil Phosphorous analyse of Device ${analyse.deviceId} has recorded a phosphorous level of ${analyse.Soil_Phosphorous} ppm, which is below the minimum threshold of ${threshold.min_SoilPhosphorous} ppm.`);
          }
        }
        if (threshold.max_SoilPhosphorous) {
          if (analyse.Soil_Phosphorous > threshold.max_SoilPhosphorous) {
            createNotification(analyse.deviceId, 'High Analyse Soil Phosphorous Alert', 
              `The Soil Phosphorous analyse of Device ${analyse.deviceId} has recorded a phosphorous level of ${analyse.Soil_Phosphorous} ppm, which is above the maximum threshold of ${threshold.min_SoilPhosphorous} ppm.`);
          }
        }

        // Check Soil Potassium
        if (threshold.min_SoilPotassium) {
          if (analyse.Soil_Potassium < threshold.min_SoilPotassium) {
            createNotification(analyse.deviceId, 'Low Analyse Soil Potassium Alert', 
              `The Soil Potassium analyse of Device ${analyse.deviceId} has recorded a potassium level of ${analyse.Soil_Potassium} ppm, which is below the minimum threshold of ${threshold.min_SoilPotassium} ppm.`);
          }
        }
        if (threshold.max_SoilPotassium) {
          if (analyse.Soil_Potassium > threshold.max_SoilPotassium) {
            createNotification(analyse.deviceId, 'High Analyse Soil Potassium Alert', 
              `The Soil Potassium analyse of Device ${analyse.deviceId} has recorded a potassium level of ${analyse.Soil_Potassium} ppm, which is above the maximum threshold of ${threshold.min_SoilPotassium} ppm.`);
          }
        }

        return { message: 'Analyse values checked and notifications generated where necessary.' };
      } catch (error) {
        console.error('Error checking analyse values:', error.message);
        return { error: error.message };
      }
    }
  };

module.exports = {
    getLastProcessedTime,
    updateLastProcessedTime,
    handleSensorThresholds,
    handleSensorParameters,
    handleAnalyseThresholds
  };