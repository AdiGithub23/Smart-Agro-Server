require("dotenv").config();

module.exports = {
  
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  },

// require('dotenv').config();
// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: 'postgres',
//   protocol: 'postgres',
//   logging: false, 
//   dialectOptions: {
//     ssl: {
//       require: true, 
//       rejectUnauthorized: false 
//     }
//   }
// });

// module.exports = sequelize;

  
  // test: {
  //   username: process.env.DB_USER,
  //   password: process.env.DB_PASSWORD,
  //   database: "database_test",
  //   host: process.env.DB_HOST,
  //   dialect: process.env.DB_DIALECT
  // },
  // production: {
  //   username: process.env.DB_USER,
  //   password: process.env.DB_PASSWORD,
  //   database: "database_production",
  //   host: process.env.DB_HOST,
  //   dialect: process.env.DB_DIALECT
  // }

//};

};