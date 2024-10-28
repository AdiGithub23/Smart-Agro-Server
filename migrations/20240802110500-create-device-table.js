"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Devices", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      inventoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Inventories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      serial_no: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      model_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Packages",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      secret_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      device_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      device_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customer_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
        defaultValue: null,
      },
      longitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
        defaultValue: null,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      assigned_SLT_admin: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      active_status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Active",
        validate: {
          isIn: [["Active", "Inactive"]],
        },
      },
      farm_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      farm_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Farms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Devices");
  },
};
