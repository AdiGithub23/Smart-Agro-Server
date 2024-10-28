'use strict';
const fs = require('fs');
const csv = require('csv-parser');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const districts = [];
    const csvFilePath = 'uploads/seeder_docs/districts.csv';

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.name) { 
            districts.push({ name: row.name });
          }
        })
        .on('end', async () => {
          console.log('Districts data collected:', districts);
          if (districts.length === 0) {
            console.log('No districts found in the CSV file.');
            resolve();
            return;
          }
          try {
            await queryInterface.bulkInsert('Districts', districts, {});
            console.log('Districts inserted successfully!');
            resolve();
          } catch (error) {
            console.error('Error inserting districts:', error);
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
    return queryInterface.bulkDelete('Districts', null, {});
  }
};
