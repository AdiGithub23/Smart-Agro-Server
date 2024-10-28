'use strict';
const fs = require('fs');
const csv = require('csv-parser');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const images = [];
    const csvFilePath = 'uploads/seeder_docs/images.csv';

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.url && row.gsDivisionId) { 
            images.push({
              url: row.url,
              gsDivisionId: parseInt(row.gsDivisionId, 10),
            });
          }
        })
        .on('end', async () => {
          console.log('Image data collected:', images);
          if (images.length === 0) {
            console.log('No images found in the CSV file.');
            resolve();
            return;
          }
          try {
            await queryInterface.bulkInsert('Images', images, {});
            console.log('Images inserted successfully!');
            resolve();
          } catch (error) {
            console.error('Error inserting images:', error);
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
    return queryInterface.bulkDelete('Images', null, {});
  }
};
