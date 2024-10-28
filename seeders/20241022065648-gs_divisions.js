'use strict';
const fs = require('fs');
const csv = require('csv-parser');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const gsDivisions = [];
    const csvFilePath = 'uploads/seeder_docs/gs_divisions.csv';

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.name && row.divisionId) { 
            gsDivisions.push({
              name: row.name,
              divisionId: parseInt(row.divisionId, 10),
            });
          }
        })
        .on('end', async () => {
          console.log('GS Divisions data collected:', gsDivisions);
          if (gsDivisions.length === 0) {
            console.log('No GS divisions found in the CSV file.');
            resolve();
            return;
          }
          try {
            await queryInterface.bulkInsert('Gs_divisions', gsDivisions, {});
            console.log('GS Divisions inserted successfully!');
            resolve();
          } catch (error) {
            console.error('Error inserting GS divisions:', error);
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
    return queryInterface.bulkDelete('Gs_divisions', null, {});
  }
};
