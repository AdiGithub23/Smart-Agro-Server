const Threshold = require('../models/threshold.js');
const Notification = require('../models/notification');
require('dotenv').config();
const nodemailer = require('nodemailer');
const { sendSms } = require('./../utility/sms.js');
const { Op } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  const Analysis = sequelize.define("Analysis", {
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
  },{
    timestamps: false,
    // hooks: {
    //   afterCreate: async (analyse, options) => {
    //     await handleThresholds(analyse);
    //   },
    //   afterUpdate: async (analyse, options) => {
    //     await handleThresholds(analyse);
    //   }
    // }
  });

  Analysis.associate = (models) => {
    Analysis.belongsTo(models.Device, {
      foreignKey: "deviceId",
      as: "device",
    });
  };


  // const handleThresholds = async (analyse) => {
  //   const threshold = await sequelize.models.Threshold.findOne({
  //     where: { deviceId: analyse.deviceId }
  //   });

  //   const managers = await sequelize.models.DeviceManager.findAll({
  //     where: { device_id: analyse.deviceId },
  //     include: [{
  //       model: sequelize.models.User,
  //       as: 'manager', 
  //       attributes: ['phone_number'] 
  //     }]
  //   });

  //   const customer = await sequelize.models.Device.findOne({
  //     where: { id: analyse.deviceId },
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
  //         notificationType: "Analyse Alert",
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

  //      // Schedule a task to check the violation status after 2 hours
  //     scheduleViolationCheck(deviceId, title);


  //   } catch (error) {
  //     console.error('Error creating notification or receivers:', error.message);
  //   }
  //   }

  //   const scheduleViolationCheck = async (deviceId, notificationTitle) => {
  //     setTimeout(async () => {
  //       await checkViolationStatus(deviceId, notificationTitle);
  //     }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
  //   };
  
  //   const checkViolationStatus = async (deviceId, notificationTitle) => {
  //     const twoHoursAgo = new Date(Date.now() - (2 * 60 * 60 * 1000));
  
  //     // Get notifications for this device created in the last 2 hours
  //     const recentNotifications = await sequelize.models.Notification.findAll({
  //       where: {
  //         deviceId,
  //         notificationType: 'Analyse Alert',
  //         createdAt: { [Op.gte]: twoHoursAgo }
  //       }
  //     });
  
  //     // If no new notifications, get the most recent notification message and recipient list
  //     if (recentNotifications.length === 0) {
  //       const lastNotification = await sequelize.models.Notification.findOne({
  //         where: {
  //           deviceId,
  //           notificationType: 'Analyse Alert'
  //         },
  //         order: [['createdAt', 'DESC']]
  //       });
  
  //       if (lastNotification) {
  //         //sendSms(managers, customer, sltadmins, lastNotification.message, lastNotification.notificationTitle);
  //         sendSms(managers, customer, sltadmins, lastNotification.message);
  //       } else {
  //         console.log(`No notification found for device ${deviceId}.`);
  //       }
  //       return;
  //     }
  
  //     // If new notifications are created, check for matching titles
  //     const matchingTitle = recentNotifications.find(n => n.notificationTitle === notificationTitle);
  
  //     if (matchingTitle) {
  //       sendSms(managers, customer, sltadmins, matchingTitle.message);
  //     } else {
  //       // Violation settled
  //       console.log(`Violation for device ${deviceId} has been settled.`);
  //     }
  //   };

  //   if (threshold) {
  //     try {
  //       // Check Air Temperature
  //       if (threshold.min_AirTemperature) {
  //         if (analyse.Air_Temperature < threshold.min_AirTemperature) {
  //           createNotification(analyse.deviceId, 'Low Analyse Air Temperature Alert', 
  //             `The Air Temperature analyse of Device ${analyse.deviceId} has detected a temperature of ${analyse.Air_Temperature}°C, which is below the minimum threshold of ${threshold.min_AirTemperature}°C.`);
  //         }
  //       }
  //       if (threshold.max_AirTemperature) {
  //         if (analyse.Air_Temperature > threshold.max_AirTemperature) {
  //           createNotification(analyse.deviceId, 'High Analyse Air Temperature Alert', 
  //             `The Air Temperature analyse of Device ${analyse.deviceId} has detected a temperature of ${analyse.Air_Temperature}°C, which is above the maximum threshold of ${threshold.max_AirTemperature}°C.`);
  //         }
  //       }
        
  //       // Check Relative Air Humidity
  //       if (threshold.min_RelativeAirHumidity) {
  //         if (analyse.Relative_Air_Humidity < threshold.min_RelativeAirHumidity) {
  //           createNotification(analyse.deviceId, 'Low Analyse Relative Air Humidity Alert', 
  //             `The Relative Air Humidity analyse of Device ${analyse.deviceId} has recorded a humidity level of ${analyse.Relative_Air_Humidity}%, which is below the minimum threshold of ${threshold.min_RelativeAirHumidity}%.`);
  //         }
  //       }
  //       if (threshold.max_RelativeAirHumidity) {
  //         if (analyse.Relative_Air_Humidity > threshold.max_RelativeAirHumidity) {
  //           createNotification(analyse.deviceId, 'High Analyse Relative Air Humidity Alert', 
  //             `The Relative Air Humidity analyse of Device ${analyse.deviceId} has recorded a humidity level of ${analyse.Relative_Air_Humidity}%, which is above the maximum threshold of ${threshold.max_RelativeAirHumidity}%.`);
  //         }
  //       }
        
  //       // Check Rainfall
  //       if (threshold.min_Rainfall) {
  //         if (analyse.Rainfall < threshold.min_Rainfall) {
  //           createNotification(analyse.deviceId, 'Low Analyse Rainfall Alert', 
  //             `The Rainfall analyse of Device ${analyse.deviceId} has detected a rainfall of ${analyse.Rainfall}mm, which is below the minimum threshold of ${threshold.min_Rainfall}mm.`);
  //         }
  //       }
  //       if (threshold.max_Rainfall) {
  //         if (analyse.Rainfall > threshold.max_Rainfall) {
  //           createNotification(analyse.deviceId, 'High Analyse Rainfall Alert', 
  //             `The Rainfall analyse of Device ${analyse.deviceId} has detected a rainfall of ${analyse.Rainfall}mm, which is above the maximum threshold of ${threshold.max_Rainfall}mm.`);
  //         }
  //       }

  //       // Check Soil Temperature
  //       if (threshold.min_SoilTemperature) {
  //         if (analyse.Soil_Temperature < threshold.min_SoilTemperature) {
  //           createNotification(analyse.deviceId, 'Low Analyse Soil Temperature Alert', 
  //             `The Soil Temperature analyse of Device ${analyse.deviceId} has recorded a temperature of ${analyse.Soil_Temperature}°C, which is below the minimum threshold of ${threshold.min_SoilTemperature}°C.`);
  //         }
  //       }
  //       if (threshold.max_SoilTemperature) {
  //         if (analyse.Soil_Temperature > threshold.max_SoilTemperature) {
  //           createNotification(analyse.deviceId, 'High Analyse Soil Temperature Alert', 
  //             `The Soil Temperature analyse of Device ${analyse.deviceId} has recorded a temperature of ${analyse.Soil_Temperature}°C, which is above the maximum threshold of ${threshold.max_SoilTemperature}°C.`);
  //         }
  //       }

  //       // Check Soil Moisture
  //       if (threshold.min_SoilMoisture) {
  //         if (analyse.Soil_Moisture < threshold.min_SoilMoisture) {
  //           createNotification(analyse.deviceId, 'Low Analyse Soil Moisture Alert', 
  //             `The Soil Moisture analyse of Device ${analyse.deviceId} has recorded a moisture level of ${analyse.Soil_Moisture}%, which is below the minimum threshold of ${threshold.min_SoilMoisture}%.`);
  //         }
  //       }
  //       if (threshold.max_SoilMoisture) {
  //         if (analyse.Soil_Moisture > threshold.max_SoilMoisture) {
  //           createNotification(analyse.deviceId, 'High Analyse Soil Moisture Alert', 
  //             `The Soil Moisture analyse of Device ${analyse.deviceId} has recorded a moisture level of ${analyse.Soil_Moisture}%, which is above the maximum threshold of ${threshold.max_SoilMoisture}%.`);
  //         }
  //       }

  //       // Check Soil pH
  //       if (threshold.min_SoilpH) {
  //         if (analyse.Soil_pH < threshold.min_SoilpH) {
  //           createNotification(analyse.deviceId, 'Low Analyse Soil pH Alert', 
  //             `The Soil pH analyse of Device ${analyse.deviceId} has recorded a pH level of ${analyse.Soil_pH}, which is below the minimum threshold of ${threshold.min_SoilpH}.`);
  //         }
  //       }
  //       if (threshold.max_SoilpH) {
  //         if (analyse.Soil_pH > threshold.max_SoilpH) {
  //           createNotification(analyse.deviceId, 'High Analyse Soil pH Alert', 
  //             `The Soil pH analyse of Device ${analyse.deviceId} has recorded a pH level of ${analyse.Soil_pH}, which is above the maximum threshold of ${threshold.max_SoilpH}.`);
  //         }
  //       }

  //       // Check Soil EC
  //       if (threshold.min_SoilEC) {
  //         if (analyse.Soil_EC < threshold.min_SoilEC) {
  //           createNotification(analyse.deviceId, 'Low Analyse Soil EC Alert', 
  //             `The Soil EC analyse of Device ${analyse.deviceId} has recorded an electrical conductivity of ${analyse.Soil_EC} dS/m, which is below the minimum threshold of ${threshold.min_SoilEC} dS/m.`);
  //         }
  //       }
  //       if (threshold.max_SoilEC) {
  //         if (analyse.Soil_EC > threshold.max_SoilEC) {
  //           createNotification(analyse.deviceId, 'High Analyse Soil EC Alert', 
  //             `The Soil EC analyse of Device ${analyse.deviceId} has recorded an electrical conductivity of ${analyse.Soil_EC} dS/m, which is above the maximum threshold of ${threshold.max_SoilEC} dS/m.`);
  //         }
  //       }

  //       // Check Soil Nitrogen
  //       if (threshold.min_SoilNitrogen) {
  //         if (analyse.Soil_Nitrogen < threshold.min_SoilNitrogen) {
  //           createNotification(analyse.deviceId,'Low Analyse Soil Nitrogen Alert', 
  //             `The Soil Nitrogen analyse of Device ${analyse.deviceId} has recorded a nitrogen level of ${analyse.Soil_Nitrogen} ppm, which is below the minimum threshold of ${threshold.min_SoilNitrogen} ppm.`);
  //         }
  //       }
  //       if (threshold.max_SoilNitrogen) {
  //         if (analyse.Soil_Nitrogen > threshold.max_SoilNitrogen) {
  //           createNotification(analyse.deviceId, 'High Analyse Soil Nitrogen Alert', 
  //             `The Soil Nitrogen analyse of Device ${analyse.deviceId} has recorded a nitrogen level of ${analyse.Soil_Nitrogen} ppm, which is above the maximum threshold of ${threshold.max_SoilNitrogen} ppm.`);
  //         }
  //       }

  //       // Check Soil Phosphorous
  //       if (threshold.min_SoilPhosphorous) {
  //         if (analyse.Soil_Phosphorous < threshold.min_SoilPhosphorous) {
  //           createNotification(analyse.deviceId, 'Low Analyse Soil Phosphorous Alert', 
  //             `The Soil Phosphorous analyse of Device ${analyse.deviceId} has recorded a phosphorous level of ${analyse.Soil_Phosphorous} ppm, which is below the minimum threshold of ${threshold.min_SoilPhosphorous} ppm.`);
  //         }
  //       }
  //       if (threshold.max_SoilPhosphorous) {
  //         if (analyse.Soil_Phosphorous > threshold.max_SoilPhosphorous) {
  //           createNotification(analyse.deviceId, 'High Analyse Soil Phosphorous Alert', 
  //             `The Soil Phosphorous analyse of Device ${analyse.deviceId} has recorded a phosphorous level of ${analyse.Soil_Phosphorous} ppm, which is above the maximum threshold of ${threshold.min_SoilPhosphorous} ppm.`);
  //         }
  //       }

  //       // Check Soil Potassium
  //       if (threshold.min_SoilPotassium) {
  //         if (analyse.Soil_Potassium < threshold.min_SoilPotassium) {
  //           createNotification(analyse.deviceId, 'Low Analyse Soil Potassium Alert', 
  //             `The Soil Potassium analyse of Device ${analyse.deviceId} has recorded a potassium level of ${analyse.Soil_Potassium} ppm, which is below the minimum threshold of ${threshold.min_SoilPotassium} ppm.`);
  //         }
  //       }
  //       if (threshold.max_SoilPotassium) {
  //         if (analyse.Soil_Potassium > threshold.max_SoilPotassium) {
  //           createNotification(analyse.deviceId, 'High Analyse Soil Potassium Alert', 
  //             `The Soil Potassium analyse of Device ${analyse.deviceId} has recorded a potassium level of ${analyse.Soil_Potassium} ppm, which is above the maximum threshold of ${threshold.min_SoilPotassium} ppm.`);
  //         }
  //       }

  //       return { message: 'Analyse values checked and notifications generated where necessary.' };
  //     } catch (error) {
  //       console.error('Error checking analyse values:', error.message);
  //       return { error: error.message };
  //     }
  //   }
  // };

  return Analysis;
};
