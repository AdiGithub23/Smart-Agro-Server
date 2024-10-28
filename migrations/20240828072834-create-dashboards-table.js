"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Dashboards", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Devices",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      poleOrPortable: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      real_time: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      alerts: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      analysis: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      yield: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.sequelize.query(`
      UPDATE "Dashboards" s
      SET "poleOrPortable" = p."poleOrPortable"
      FROM "Devices" d
      JOIN "Packages" p ON d."package_id" = p."id"
      WHERE s."device_id" = d."id";
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Dashboards");
  },
};
