"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Packages", "packageId");

    await queryInterface.addColumn("Packages", "fixedCharge", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Packages", "packageId", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.removeColumn("Packages", "fixedCharge");
  },
};
