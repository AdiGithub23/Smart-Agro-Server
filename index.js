const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const contactUsroutes = require("./routes/contactUsRoutes");
const userRoutes = require("./routes/userRoutes");
const loginRoutes = require("./routes/loginRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const deviceManagerRoutes = require("./routes/deviceManagerRoutes");
const farmRoutes = require("./routes/farmRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const yieldRoutes = require("./routes/yieldRoutes");
const packageRoutes = require("./routes/packageRoutes");
const thresholdRoutes = require("./routes/thresholdRoutes");
const registerRoutes = require("./routes/registerRoutes");
const messageRoutes = require("./routes/messageRoutes");
const parameterRoutes = require("./routes/parameterRoutes");
const sensorRoutes = require("./routes/sensorRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const superadminRoutes = require("./routes/superadminRoutes");
const customeradminRoutes = require("./routes/customeradminRoutes");
const dashboardRoutes = require("./routes/dashboardRoute");
const analysisRoutes = require("./routes/analysisRoutes");
const recommendationRoutes=require("./routes/recommendationRoutes.js");

const { getLastProcessedTime, updateLastProcessedTime, handleSensorThresholds, handleSensorParameters, handleAnalyseThresholds } = require('./utility/notification.js');
const { sequelize } = require('./models');
const { Op } = require('sequelize');

require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, "public")));


app.use(cors());

const checkNewSensorData = async () => {
  try {
    const lastProcessedTime = await getLastProcessedTime(); 
    // const newSensorData = await sequelize.models.Sensor.findAll({
    //   where: {
    //     recorded_at: { [Op.gt]: lastProcessedTime }, 
    //   },
    //   order: [['recorded_at', 'DESC']], 
    //   limit: 1
    // });

    // const newAnalyseData = await sequelize.models.Analysis.findAll({
    //   where: {
    //     recorded_at: { [Op.gt]: lastProcessedTime }, 
    //   },
    //   order: [['recorded_at', 'DESC']], 
    //   limit: 1
    // });

    const devices = await sequelize.models.Device.findAll();

    const deviceIds = devices.map(device => device.id);

    const newSensorData = await sequelize.models.Sensor.findAll({
      where: {
        deviceId: { [Op.in]: deviceIds },
        recorded_at: { [Op.gt]: lastProcessedTime }
      },
      order: [['deviceId', 'ASC'], ['recorded_at', 'DESC']]
    });

    const newAnalyseData = await sequelize.models.Analysis.findAll({
      where: {
        deviceId: { [Op.in]: deviceIds },
        recorded_at: { [Op.gt]: lastProcessedTime }
      },
      order: [['deviceId', 'ASC'], ['recorded_at', 'DESC']]
    });

    

    // Filter latest records per deviceId
    const latestSensorData = {};
    newSensorData.forEach(sensor => {
      if (!latestSensorData[sensor.deviceId]) {
        latestSensorData[sensor.deviceId] = sensor;
      }
    });

    for (const sensor of Object.values(latestSensorData)) {
      await handleSensorThresholds(sensor);
      await handleSensorParameters(sensor);
    }

    const latestAnalyseData = {};
    newAnalyseData.forEach(analyse => {
      if (!latestAnalyseData[analyse.deviceId]) {
        latestAnalyseData[analyse.deviceId] = analyse;
      }
    });

    for (const analyse of Object.values(latestAnalyseData)) {
      await handleAnalyseThresholds(analyse);  
    }

    // for (const sensor of newSensorData) {
    //   await handleSensorThresholds(sensor);  
    //   await handleSensorParameters(sensor);
    // }

    // for (const analyse of newAnalyseData) {
    //   await handleAnalyseThresholds(analyse);  
    // }

    await updateLastProcessedTime();  
  } catch (error) {
    console.error('Error in polling data:', error);
  }
};

// Polling function to run periodically
const startPolling = () => {
  setInterval(checkNewSensorData, 1800000); // Poll every 30 minutes
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth/register", registerRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", loginRoutes);
app.use("/api/landing-page", contactUsroutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/device-manager", deviceManagerRoutes);
app.use("/api/farm", farmRoutes);
app.use("/api/yield", yieldRoutes);
app.use("/api/threshold", thresholdRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/parameters", parameterRoutes);
app.use("/api/real-time", sensorRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/superadmin", superadminRoutes);
app.use("/api/customeradmin", customeradminRoutes);
app.use("/api/settings", dashboardRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/recommendation",recommendationRoutes);

app.listen(5000, () => {
  console.log(`Example app listening on port 5000`);
  {/*---------------startPolling();---------------*/}
});
