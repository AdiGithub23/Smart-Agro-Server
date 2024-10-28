const { Device, Package, Parameter } = require("../models");

exports.getParameters = async (req, res) => {
  try {
    const parameters = await Parameter.findAll({
      attributes: ["parameter"],
    });

    const parameterList = parameters.map((param) => param.parameter);

    res.status(200).json(parameterList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getParametersByDeviceId = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findOne({
      where: { id: id },
      include: {
        model: Package,
        as: "package",
      },
    });

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    const pkg = device.package;

    if (!pkg) {
      return res
        .status(404)
        .json({ error: "Package not found for this device" });
    }
    return res.status(200).json(pkg.parameters);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "An error occurred while retrieving parameters" });
  }
};
