'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Packages', 'monthlyRental', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });
    await queryInterface.changeColumn('Packages', 'fixedCharge', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Packages', 'monthlyRental', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
    await queryInterface.changeColumn('Packages', 'fixedCharge', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
  }
};
