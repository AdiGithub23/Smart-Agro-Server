const Threshold = require('../models/threshold.js');
const Notification = require('../models/notification');
require('dotenv').config();
const nodemailer = require('nodemailer');
const { sendSms } = require('./../utility/sms.js');
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Sensor = sequelize.define("Sensor", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    deviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Devices",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    Air_Temperature: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Relative_Air_Humidity: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Rainfall: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Soil_Temperature: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Soil_Moisture: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Soil_pH: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Soil_EC: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Soil_Nitrogen: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Soil_Phosphorous: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Soil_Potassium: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    recorded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: false,
    // hooks: {
    //   afterCreate: async (sensor, options) => {
    //     await handleThresholds(sensor);
    //     await handleParameters(sensor);
    //   },
    //   afterUpdate: async (sensor, options) => {
    //     await handleThresholds(sensor);
    //     await handleParameters(sensor);
    //   }
    // }
  });

  // const handleThresholds = async (sensor) => {
  //   const threshold = await sequelize.models.Threshold.findOne({
  //     where: { deviceId: sensor.deviceId },
  //     order: [['createdAt', 'DESC']], 
  //     limit: 1
  //   });    

  //   const managers = await sequelize.models.DeviceManager.findAll({
  //     where: { device_id: sensor.deviceId },
  //     include: [{
  //       model: sequelize.models.User,
  //       as: 'manager', 
  //       attributes: ['phone_number'] 
  //     }]
  //   });

  //   const customer = await sequelize.models.Device.findOne({
  //     where: { id: sensor.deviceId },
  //     include: [{
  //       model: sequelize.models.User,
  //       as: 'customer', 
  //       attributes: ['phone_number'] 
  //     }]
  //   });

  //   const sltadmins = await sequelize.models.User.findAll({
  //     where: { user_role: 'slt-admin' }
  //   });

  //   const createNotification = async (deviceId, title, message) => {
  //     try {
  //       const notification = await sequelize.models.Notification.create({
  //         deviceId,
  //         notificationType: 'Real-time Alert',
  //         notificationTitle: title,
  //         message,
  //         isRead: null
  //       });

  //     // Create NotificationReceiver records for all managers
  //     for (const manager of managers) {
  //       await sequelize.models.NotificationReceiver.create({
  //         notificationId: notification.id,
  //         receiverId: manager.manager_id, 
  //       });
  //     }

  //     // Create NotificationReceiver record for the customer
  //     if (customer && customer.customer_id) {
  //       await sequelize.models.NotificationReceiver.create({
  //         notificationId: notification.id,
  //         receiverId: customer.customer_id, 
  //       });
  //     }

  //     // Create NotificationReceiver records for all SLT Admins
  //     for (const sltadmin of sltadmins) {
  //       await sequelize.models.NotificationReceiver.create({
  //         notificationId: notification.id,
  //         receiverId: sltadmin.id,
  //       });
  //     }

  //     // setTimeout(() => {
  //     //   sendEmailToSmsGateway(managers, customer, sltadmins, title, message);
  //     // }, 1.2 * 60 * 60 * 1000); // 2 hours in milliseconds
  //     //sendEmailToSmsGateway(managers, customer, sltadmins, title, message);

  //     scheduleViolationCheck(deviceId, title);

      
  //   } catch (error) {
  //     console.error('Error creating notification or receivers:', error.message);
  //   }
  // }

  // const scheduleViolationCheck = async (deviceId, notificationTitle) => {
  //   setTimeout(async () => {
  //     await checkViolationStatus(deviceId, notificationTitle);
  //   }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
  // };

  // const checkViolationStatus = async (deviceId, notificationTitle) => {
  //   const twoHoursAgo = new Date(Date.now() - (2 * 60 * 60 * 1000));

  //   // Get notifications for this device created in the last 2 hours
  //   const recentNotifications = await sequelize.models.Notification.findAll({
  //     where: {
  //       deviceId,
  //       notificationType: 'Real-time Alert',
  //       createdAt: { [Op.gte]: twoHoursAgo }
  //     }
  //   });

  //   // If no new notifications, get the most recent notification message and recipient list
  //   if (recentNotifications.length === 0) {
  //     const lastNotification = await sequelize.models.Notification.findOne({
  //       where: {
  //         deviceId,
  //         notificationType: 'Real-time Alert'
  //       },
  //       order: [['createdAt', 'DESC']]
  //     });

  //     if (lastNotification) {
  //       //sendSms(managers, customer, sltadmins, lastNotification.message, lastNotification.notificationTitle);
  //       sendSms(managers, customer, sltadmins, lastNotification.message);
  //     } else {
  //       console.log(`No notification found for device ${deviceId}.`);
  //     }
  //     return;
  //   }

  //   // If new notifications are created, check for matching titles
  //   const matchingTitle = recentNotifications.find(n => n.notificationTitle === notificationTitle);

  //   if (matchingTitle) {
  //     sendSms(managers, customer, sltadmins, matchingTitle.message);
  //   } else {
  //     // Violation settled
  //     console.log(`Violation for device ${deviceId} has been settled.`);
  //   }
  // };

  //   if (threshold) {
  //     try {
  //       // Check Air Temperature
  //       if (threshold.min_AirTemperature) {
  //         if (sensor.Air_Temperature < threshold.min_AirTemperature) {
  //           createNotification(sensor.deviceId, 'Low Air Temperature Alert', 
  //             `The Air Temperature sensor of Device ${sensor.deviceId} has detected a temperature of ${sensor.Air_Temperature}°C, which is below the minimum threshold of ${threshold.min_AirTemperature}°C.`);
  //         }
  //       }
  //       if (threshold.max_AirTemperature) {
  //         if (sensor.Air_Temperature > threshold.max_AirTemperature) {
  //           createNotification(sensor.deviceId, 'High Air Temperature Alert', 
  //             `The Air Temperature sensor of Device ${sensor.deviceId} has detected a temperature of ${sensor.Air_Temperature}°C, which is above the maximum threshold of ${threshold.max_AirTemperature}°C.`);
  //         }
  //       }
        
  //       // Check Relative Air Humidity
  //       if (threshold.min_RelativeAirHumidity) {
  //         if (sensor.Relative_Air_Humidity < threshold.min_RelativeAirHumidity) {
  //           createNotification(sensor.deviceId, 'Low Relative Air Humidity Alert', 
  //             `The Relative Air Humidity sensor of Device ${sensor.deviceId} has recorded a humidity level of ${sensor.Relative_Air_Humidity}%, which is below the minimum threshold of ${threshold.min_RelativeAirHumidity}%.`);
  //         }
  //       }
  //       if (threshold.max_RelativeAirHumidity) {
  //         if (sensor.Relative_Air_Humidity > threshold.max_RelativeAirHumidity) {
  //           createNotification(sensor.deviceId, 'High Relative Air Humidity Alert', 
  //             `The Relative Air Humidity sensor of Device ${sensor.deviceId} has recorded a humidity level of ${sensor.Relative_Air_Humidity}%, which is above the maximum threshold of ${threshold.max_RelativeAirHumidity}%.`);
  //         }
  //       }
        
  //       // Check Rainfall
  //       if (threshold.min_Rainfall) {
  //         if (sensor.Rainfall < threshold.min_Rainfall) {
  //           createNotification(sensor.deviceId, 'Low Rainfall Alert', 
  //             `The Rainfall sensor of Device ${sensor.deviceId} has detected a rainfall of ${sensor.Rainfall}mm, which is below the minimum threshold of ${threshold.min_Rainfall}mm.`);
  //         }
  //       }
  //       if (threshold.max_Rainfall) {
  //         if (sensor.Rainfall > threshold.max_Rainfall) {
  //           createNotification(sensor.deviceId, 'High Rainfall Alert', 
  //             `The Rainfall sensor of Device ${sensor.deviceId} has detected a rainfall of ${sensor.Rainfall}mm, which is above the maximum threshold of ${threshold.max_Rainfall}mm.`);
  //         }
  //       }

  //       // Check Soil Temperature
  //       if (threshold.min_SoilTemperature) {
  //         if (sensor.Soil_Temperature < threshold.min_SoilTemperature) {
  //           createNotification(sensor.deviceId, 'Low Soil Temperature Alert', 
  //             `The Soil Temperature sensor of Device ${sensor.deviceId} has recorded a temperature of ${sensor.Soil_Temperature}°C, which is below the minimum threshold of ${threshold.min_SoilTemperature}°C.`);
  //         }
  //       }
  //       if (threshold.max_SoilTemperature) {
  //         if (sensor.Soil_Temperature > threshold.max_SoilTemperature) {
  //           createNotification(sensor.deviceId, 'High Soil Temperature Alert', 
  //             `The Soil Temperature sensor of Device ${sensor.deviceId} has recorded a temperature of ${sensor.Soil_Temperature}°C, which is above the maximum threshold of ${threshold.max_SoilTemperature}°C.`);
  //         }
  //       }

  //       // Check Soil Moisture
  //       if (threshold.min_SoilMoisture) {
  //         if (sensor.Soil_Moisture < threshold.min_SoilMoisture) {
  //           createNotification(sensor.deviceId, 'Low Soil Moisture Alert', 
  //             `The Soil Moisture sensor of Device ${sensor.deviceId} has recorded a moisture level of ${sensor.Soil_Moisture}%, which is below the minimum threshold of ${threshold.min_SoilMoisture}%.`);
  //         }
  //       }
  //       if (threshold.max_SoilMoisture) {
  //         if (sensor.Soil_Moisture > threshold.max_SoilMoisture) {
  //           createNotification(sensor.deviceId, 'High Soil Moisture Alert', 
  //             `The Soil Moisture sensor of Device ${sensor.deviceId} has recorded a moisture level of ${sensor.Soil_Moisture}%, which is above the maximum threshold of ${threshold.max_SoilMoisture}%.`);
  //         }
  //       }

  //       // Check Soil pH
  //       if (threshold.min_SoilpH) {
  //         if (sensor.Soil_pH < threshold.min_SoilpH) {
  //           createNotification(sensor.deviceId, 'Low Soil pH Alert', 
  //             `The Soil pH sensor of Device ${sensor.deviceId} has recorded a pH level of ${sensor.Soil_pH}, which is below the minimum threshold of ${threshold.min_SoilpH}.`);
  //         }
  //       }
  //       if (threshold.max_SoilpH) {
  //         if (sensor.Soil_pH > threshold.max_SoilpH) {
  //           createNotification(sensor.deviceId, 'High Soil pH Alert', 
  //             `The Soil pH sensor of Device ${sensor.deviceId} has recorded a pH level of ${sensor.Soil_pH}, which is above the maximum threshold of ${threshold.max_SoilpH}.`);
  //         }
  //       }

  //       // Check Soil EC
  //       if (threshold.min_SoilEC) {
  //         if (sensor.Soil_EC < threshold.min_SoilEC) {
  //           createNotification(sensor.deviceId, 'Low Soil EC Alert', 
  //             `The Soil EC sensor of Device ${sensor.deviceId} has recorded an electrical conductivity of ${sensor.Soil_EC} dS/m, which is below the minimum threshold of ${threshold.min_SoilEC} dS/m.`);
  //         }
  //       }
  //       if (threshold.max_SoilEC) {
  //         if (sensor.Soil_EC > threshold.max_SoilEC) {
  //           createNotification(sensor.deviceId, 'High Soil EC Alert', 
  //             `The Soil EC sensor of Device ${sensor.deviceId} has recorded an electrical conductivity of ${sensor.Soil_EC} dS/m, which is above the maximum threshold of ${threshold.max_SoilEC} dS/m.`);
  //         }
  //       }

  //       // Check Soil Nitrogen
  //       if (threshold.min_SoilNitrogen) {
  //         if (sensor.Soil_Nitrogen < threshold.min_SoilNitrogen) {
  //           createNotification(sensor.deviceId, 'Low Soil Nitrogen Alert', 
  //             `The Soil Nitrogen sensor of Device ${sensor.deviceId} has recorded a nitrogen level of ${sensor.Soil_Nitrogen} ppm, which is below the minimum threshold of ${threshold.min_SoilNitrogen} ppm.`);
  //         }
  //       }
  //       if (threshold.max_SoilNitrogen) {
  //         if (sensor.Soil_Nitrogen > threshold.max_SoilNitrogen) {
  //           createNotification(sensor.deviceId, 'High Soil Nitrogen Alert', 
  //             `The Soil Nitrogen sensor of Device ${sensor.deviceId} has recorded a nitrogen level of ${sensor.Soil_Nitrogen} ppm, which is above the maximum threshold of ${threshold.max_SoilNitrogen} ppm.`);
  //         }
  //       }

  //       // Check Soil Phosphorous
  //       if (threshold.min_SoilPhosphorous) {
  //         if (sensor.Soil_Phosphorous < threshold.min_SoilPhosphorous) {
  //           createNotification(sensor.deviceId, 'Low Soil Phosphorous Alert', 
  //             `The Soil Phosphorous sensor of Device ${sensor.deviceId} has recorded a phosphorous level of ${sensor.Soil_Phosphorous} ppm, which is below the minimum threshold of ${threshold.min_SoilPhosphorous} ppm.`);
  //         }
  //       }
  //       if (threshold.max_SoilPhosphorous) {
  //         if (sensor.Soil_Phosphorous > threshold.max_SoilPhosphorous) {
  //           createNotification(sensor.deviceId, 'High Soil Phosphorous Alert', 
  //             `The Soil Phosphorous sensor of Device ${sensor.deviceId} has recorded a phosphorous level of ${sensor.Soil_Phosphorous} ppm, which is above the maximum threshold of ${threshold.min_SoilPhosphorous} ppm.`);
  //         }
  //       }

  //       // Check Soil Potassium
  //       if (threshold.min_SoilPotassium) {
  //         if (sensor.Soil_Potassium < threshold.min_SoilPotassium) {
  //           createNotification(sensor.deviceId, 'Low Soil Potassium Alert', 
  //             `The Soil Potassium sensor of Device ${sensor.deviceId} has recorded a potassium level of ${sensor.Soil_Potassium} ppm, which is below the minimum threshold of ${threshold.min_SoilPotassium} ppm.`);
  //         }
  //       }
  //       if (threshold.max_SoilPotassium) {
  //         if (sensor.Soil_Potassium > threshold.max_SoilPotassium) {
  //           createNotification(sensor.deviceId, 'High Soil Potassium Alert', 
  //             `The Soil Potassium sensor of Device ${sensor.deviceId} has recorded a potassium level of ${sensor.Soil_Potassium} ppm, which is above the maximum threshold of ${threshold.min_SoilPotassium} ppm.`);
  //         }
  //       }

  //       return { message: 'Sensor values checked and notifications generated where necessary.' };
  //     } catch (error) {
  //       console.error('Error checking sensor values:', error.message);
  //       return { error: error.message };
  //     }
  //   }
  // }

//   const handleParameters = async (sensor) => {

//     const parameters = await sequelize.models.Parameter.findAll();

//     const managers = await sequelize.models.DeviceManager.findAll({
//       where: { device_id: sensor.deviceId },
//       include: [{
//         model: sequelize.models.User,
//         as: 'manager', 
//         attributes: ['phone_number'] 
//       }]
//     });

//     const customer = await sequelize.models.Device.findOne({
//       where: { id: sensor.deviceId },
//       include: [{
//         model: sequelize.models.User,
//         as: 'customer', 
//         attributes: ['phone_number'] 
//       }]
//     });

//     const sltadmins = await sequelize.models.User.findAll({
//       where: { user_role: 'slt-admin' }
//     });

//     const createNotification = async (deviceId, title, message) => {
//       try {
//         const notification = await sequelize.models.Notification.create({
//           deviceId,
//           notificationType: 'Parameter Alert',
//           notificationTitle: title,
//           message,
//           isRead: null
//         });

//       // Create NotificationReceiver records for all managers
//       for (const manager of managers) {
//         await sequelize.models.NotificationReceiver.create({
//           notificationId: notification.id,
//           receiverId: manager.manager_id, 
//         });
//       }

//       // Create NotificationReceiver record for the customer
//       if (customer && customer.customer_id) {
//         await sequelize.models.NotificationReceiver.create({
//           notificationId: notification.id,
//           receiverId: customer.customer_id, 
//         });
//       }

//       // Create NotificationReceiver records for all SLT Admins
//       for (const sltadmin of sltadmins) {
//         await sequelize.models.NotificationReceiver.create({
//           notificationId: notification.id,
//           receiverId: sltadmin.id,
//         });
//       }

//       // setTimeout(() => {
//       //   sendEmailToSmsGateway(managers, customer, sltadmins, title, message);
//       // }, 1.2 * 60 * 60 * 1000); // 2 hours in milliseconds
//       sendSms(managers, customer, sltadmins, message);

      
//     } catch (error) {
//       console.error('Error creating notification or receivers:', error.message);
//     }
//   }

//     if(parameters){
//     try{
//       parameters.forEach((parameter) => {
//         const { parameter: paramName, unit, min_value, max_value } = parameter;

//         if (paramName=='Air Temperature'){
//           if (sensor.Air_Temperature < min_value) {
//             createNotification(sensor.deviceId, 'Low Air Temperature Parameter Alert', 
//               `The Air Temperature sensor of Device ${sensor.deviceId} has recorded a temperature level of ${sensor.Air_Temperature} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
//           }
//           if (sensor.Air_Temperature > max_value) {
//             createNotification(sensor.deviceId,  'High Air Temperature Parameter Alert', 
//               `The Air Temperature sensor of Device ${sensor.deviceId} has recorded a temperature level of ${sensor.Air_Temperature} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
//           }
//         }
//         if (paramName=='Relative Air Humidity'){
//           if (sensor.Relative_Air_Humidity < min_value) {
//             createNotification(sensor.deviceId, 'Low Relative Air Humidity Parameter Alert', 
//               `The Relative Air Humidity sensor of Device ${sensor.deviceId} has recorded a humidity level of ${sensor.Relative_Air_Humidity} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
//           }
//           if (sensor.Relative_Air_Humidity > max_value) {
//             createNotification(sensor.deviceId, 'High Air Temperature Parameter Alert', 
//               `The Relative Air Humidity sensor of Device ${sensor.deviceId} has recorded a humidity level of ${sensor.Relative_Air_Humidity} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
//           }
//         }
//         if (paramName=='Rainfall'){
//           if (sensor.Rainfall < min_value) {
//             createNotification(sensor.deviceId, 'Low Rainfall Parameter Alert', 
//               `The Rainfall sensor of Device ${sensor.deviceId} has recorded a rainfall level of ${sensor.Rainfall} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
//           }
//           if (sensor.Rainfall > max_value) {
//             createNotification(sensor.deviceId, 'High Rainfall Parameter Alert', 
//               `The Rainfall sensor of Device ${sensor.deviceId} has recorded a rainfall level of ${sensor.Rainfall} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
//           }
//         }
//         if (paramName=='Soil Temperature'){
//           if (sensor.Soil_Temperature < min_value) {
//             createNotification(sensor.deviceId, 'Low Soil Temperature Parameter Alert', 
//               `The Soil Temperature sensor of Device ${sensor.deviceId} has recorded a temperature level of ${sensor.Soil_Temperature} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
//           }
//           if (sensor.Soil_Temperature > max_value) {
//             createNotification(sensor.deviceId, 'High Soil Temperature Parameter Alert', 
//               `The Soil Temperature sensor of Device ${sensor.deviceId} has recorded a temperature level of ${sensor.Soil_Temperature} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
//           }
//         }
//         if (paramName=='Soil Moisture'){
//           if (sensor.Soil_Temperature < min_value) {
//             createNotification(sensor.deviceId, 'Low Soil Temperature Parameter Alert', 
//               `The Soil Temperature sensor of Device ${sensor.deviceId} has recorded a temperature level of ${sensor.Soil_Temperature} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
//           }
//           if (sensor.Soil_Temperature > max_value) {
//             createNotification(sensor.deviceId, 'High Soil Temperature Parameter Alert', 
//               `The Soil Temperature sensor of Device ${sensor.deviceId} has recorded a temperature level of ${sensor.Soil_Temperature} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
//           }
//         }
//         if (paramName=='Soil pH'){
//           if (sensor.Soil_pH < min_value) {
//             createNotification(sensor.deviceId, 'Low Soil pH Parameter Alert', 
//               `The Soil pH sensor of Device ${sensor.deviceId} has recorded a pH level of ${sensor.Soil_pH} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
//           }
//           if (sensor.Soil_pH > max_value) {
//             createNotification(sensor.deviceId, 'High Soil pH Parameter Alert', 
//               `The Soil pH sensor of Device ${sensor.deviceId} has recorded a pH level of ${sensor.Soil_pH} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
//           }
//         }
//         if (paramName=='Soil EC'){
//           if (sensor.Soil_EC < min_value) {
//             createNotification(sensor.deviceId, 'Low Soil EC Parameter Alert', 
//               `The Soil EC sensor of Device ${sensor.deviceId} has recorded a EC level of ${sensor.Soil_EC} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
//           }
//           if (sensor.Soil_EC > max_value) {
//             createNotification(sensor.deviceId, 'High Soil EC Parameter Alert', 
//               `The Soil EC sensor of Device ${sensor.deviceId} has recorded a EC level of ${sensor.Soil_EC} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
//           }
//         }
//         if (paramName=='Soil Nitrogen'){
//           if (sensor.Soil_Nitrogen < min_value) {
//             createNotification(sensor.deviceId, 'Low Soil Nitrogen Parameter Alert', 
//               `The Soil Nitrogen sensor of Device ${sensor.deviceId} has recorded a Nitrogen level of ${sensor.Soil_Nitrogen} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
//           }
//           if (sensor.Soil_Nitrogen > max_value) {
//             createNotification(sensor.deviceId, 'High Soil Nitrogen Parameter Alert', 
//               `The Soil Nitrogen sensor of Device ${sensor.deviceId} has recorded a Nitrogen level of ${sensor.Soil_Nitrogen} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
//           }
//         }
//         if (paramName=='Soil Potassium'){
//           if (sensor.Soil_Potassium < min_value) {
//             createNotification(sensor.deviceId, 'Low Soil Potassium Parameter Alert', 
//               `The Soil Potassium sensor of Device ${sensor.deviceId} has recorded a Nitrogen level of ${sensor.Soil_Potassium} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
//           }
//           if (sensor.Soil_Potassium > max_value) {
//             createNotification(sensor.deviceId, 'High Soil Potassium Parameter Alert', 
//               `The Soil Potassium sensor of Device ${sensor.deviceId} has recorded a Potassium level of ${sensor.Soil_Potassium} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
//           }
//         }
//         if (paramName=='Soil Phosphorous'){
//           if (sensor.Soil_Phosphorous < min_value) {
//             createNotification(sensor.deviceId, 'Low Soil Phosphorous Parameter Alert', 
//               `The Soil Phosphorous sensor of Device ${sensor.deviceId} has recorded a Phosphorous level of ${sensor.Soil_Phosphorous} ${unit}, which is below the minimum parameter value of ${min_value} ${unit}.`);
//           }
//           if (sensor.Soil_Phosphorous > max_value) {
//             createNotification(sensor.deviceId, 'High Soil Phosphorous Parameter Alert', 
//               `The Soil Phosphorous sensor of Device ${sensor.deviceId} has recorded a Phosphorous level of ${sensor.Soil_Phosphorous} ${unit}, which is above the maximum parameter value of ${max_value} ${unit}.`);
//           }
//       }
//     });
//   } catch (error) {
//     console.error('Error checking parameters:', error.message);
//   }
//     }
// }

  Sensor.associate = (models) => {
    Sensor.belongsTo(models.Device, {
      foreignKey: "deviceId",
      as: "device",
    });
  };

  return Sensor;
};
