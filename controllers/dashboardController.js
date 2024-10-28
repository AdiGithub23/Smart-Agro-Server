const { Device, Package, Dashboard } = require("../models");

exports.createDashboardSettings = async (req, res) => {
  try {
    const { device_id } = req.query;
    const { real_time, alerts, analysis, yield: yieldSetting } = req.body;

    const device = await Device.findOne({
      where: { id: device_id },
      include: {
        model: Package,
        as: "package",
        attributes: ["poleOrPortable"],
      },
    });

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    const poleOrPortable = device.package.poleOrPortable;

    let defaultSettings = {
      real_time: true,
      alerts: true,
      analysis: poleOrPortable === "Pole",
      yield: true,
    };

    const settings = {
      device_id,
      poleOrPortable,
      real_time:
        real_time !== undefined ? real_time : defaultSettings.real_time,
      alerts: alerts !== undefined ? alerts : defaultSettings.alerts,
      analysis: analysis !== undefined ? analysis : defaultSettings.analysis,
      yield: yieldSetting !== undefined ? yieldSetting : defaultSettings.yield,
    };

    const [dashboards, created] = await Dashboard.upsert(settings, {
      returning: true,
    });

    return res.status(200).json({ dashboards, created });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "An error occurred while saving settings" });
  }
};

exports.editDashboardSettings = async (req, res) => {
  try {
    const { device_id } = req.query;
    const { real_time, alerts, analysis, yield: yieldSetting } = req.body;

    const device = await Device.findOne({
      where: { id: device_id },
      include: {
        model: Package,
        as: "package",
        attributes: ["poleOrPortable"],
      },
    });

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    const dashboard = await Dashboard.findOne({ where: { device_id } });

    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard settings not found" });
    }

    const updatedDashboard = await dashboard.update({
      real_time: real_time !== undefined ? real_time : dashboard.real_time,
      alerts: alerts !== undefined ? alerts : dashboard.alerts,
      analysis: analysis !== undefined ? analysis : dashboard.analysis,
      yield: yieldSetting !== undefined ? yieldSetting : dashboard.yield,
    });

    return res
      .status(200)
      .json({ message: "Dashboard settings updated", updatedDashboard });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "An error occurred while updating settings" });
  }
};

exports.viewDashboardSettings = async (req, res) => {
  try {
    const { device_id } = req.query;

    const device = await Device.findOne({
      where: { id: device_id },
      include: {
        model: Package,
        as: "package",
        attributes: ["poleOrPortable"],
      },
    });

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    const dashboard = await Dashboard.findOne({
      where: { device_id },
      attributes: ["real_time", "alerts", "analysis", "yield"],
    });

    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard settings not found" });
    }

    return res.status(200).json({
      device_id: device.id,
      poleOrPortable: device.package.poleOrPortable,
      real_time: dashboard.real_time,
      alerts: dashboard.alerts,
      analysis: dashboard.analysis,
      yield: dashboard.yield,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "An error occurred while retrieving settings" });
  }
};
