'use strict';
const fs = require('fs');
const csv = require('csv-parser');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const divisions = [];
    const csvFilePath = 'uploads/seeder_docs/divisions.csv';

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.name && row.districtId) { 
            divisions.push({
              name: row.name,
              districtId: parseInt(row.districtId, 10),
            });
          }
        })
        .on('end', async () => {
          console.log('Divisions data collected:', divisions);
          if (divisions.length === 0) {
            console.log('No divisions found in the CSV file.');
            resolve();
            return;
          }
          try {
            await queryInterface.bulkInsert('Divisions', divisions, {});
            console.log('Divisions inserted successfully!');
            resolve();
          } catch (error) {
            console.error('Error inserting divisions:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('Error reading the CSV file:', error);
          reject(error);
        });
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Divisions', null, {});
  }
};
