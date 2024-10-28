'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Packages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      packageId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      packageName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      connectivityType: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      monthlyRental: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      features: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      poleOrPortable: {
        type: Sequelize.ENUM,
        values: ['Pole', 'Portable'],
        allowNull: false,
      },
      landingPageVisibility: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      parameters: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Packages');
  },
};
