"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Farms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      farm_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      farmAddress: {
        type: Sequelize.STRING,
        allowNull: false
      },
      farmContactNo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      farmEmail: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      createdById: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // await queryInterface.createTable('FarmDevices', {
    //   farm_id: {
    //     type: Sequelize.INTEGER,
    //     references: {
    //       model: 'Farms',
    //       key: 'id',
    //     },
    //     onUpdate: 'CASCADE',
    //     onDelete: 'CASCADE',
    //     primaryKey: true,
    //     allowNull: true,
    //   },
    //   deviceId: {
    //     type: Sequelize.INTEGER,
    //     references: {
    //       model: 'Devices',
    //       key: 'id',
    //     },
    //     onUpdate: 'CASCADE',
    //     onDelete: 'CASCADE',
    //     primaryKey: true,
    //     allowNull: true,
    //   },
    //   createdAt: {
    //     allowNull: false,
    //     type: Sequelize.DATE,
    //     defaultValue: Sequelize.NOW,
    //   },
    //   updatedAt: {
    //     allowNull: false,
    //     type: Sequelize.DATE,
    //     defaultValue: Sequelize.NOW,
    //   },
    // });

    // await queryInterface.createTable('FarmManagers', {
    //   id: {
    //     allowNull: false,
    //     autoIncrement: true,
    //     primaryKey: true,
    //     type: Sequelize.INTEGER
    //   },
    //   farm_id: {
    //     type: Sequelize.INTEGER,
    //     references: {
    //       model: 'Farms',
    //       key: 'id',
    //     },
    //     onUpdate: 'CASCADE',
    //     onDelete: 'CASCADE',
    //     primaryKey: true,
    //     allowNull: true,
    //   },
    //   userId: {
    //     type: Sequelize.INTEGER,
    //     references: {
    //       model: 'Users',
    //       key: 'id',
    //     },
    //     onUpdate: 'CASCADE',
    //     onDelete: 'CASCADE',
    //     primaryKey: true,
    //     allowNull: true,
    //   },
    //   createdAt: {
    //     allowNull: false,
    //     type: Sequelize.DATE,
    //     defaultValue: Sequelize.NOW,
    //   },
    //   updatedAt: {
    //     allowNull: false,
    //     type: Sequelize.DATE,
    //     defaultValue: Sequelize.NOW,
    //   },
    // });

  },

  down: async (queryInterface, Sequelize) => {
    //await queryInterface.dropTable('FarmManagers');
    //await queryInterface.dropTable('FarmDevices');
    await queryInterface.dropTable('Farms');
  }
};

