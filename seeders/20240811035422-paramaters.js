"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Parameters", [
      {
        id: 1,
        parameter: "Air Temperature",
        unit: "°C",
        min_value: 0,
        max_value: 60,
      },
      {
        id: 2,
        parameter: "Relative Air Humidity",
        unit: "%RH",
        min_value: 0,
        max_value: 100,
      },
      {
        id: 3,
        parameter: "Rainfall",
        unit: "mm",
        min_value: 0,
        max_value: 400,
      },
      {
        id: 4,
        parameter: "Soil Temperature",
        unit: "°C",
        min_value: 0,
        max_value: 60,
      },
      {
        id: 5,
        parameter: "Soil Moisture",
        unit: "%",
        min_value: 0,
        max_value: 100,
      },
      { id: 6, parameter: "Soil pH", unit: "", min_value: 3, max_value: 9 },
      {
        id: 7,
        parameter: "Soil EC",
        unit: "µS/cm",
        min_value: 0,
        max_value: 20000,
      },
      {
        id: 8,
        parameter: "Soil Nitrogen",
        unit: "ppm",
        min_value: 0,
        max_value: 1999,
      },
      {
        id: 9,
        parameter: "Soil Phosphorous",
        unit: "ppm",
        min_value: 0,
        max_value: 1999,
      },
      {
        id: 10,
        parameter: "Soil Potassium",
        unit: "ppm",
        min_value: 0,
        max_value: 1999,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Parameters", null, {});
  },
};
