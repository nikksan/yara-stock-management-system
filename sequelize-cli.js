/*
  Sequelize CLI requires the existence of a physical file to load its configuration (with that exact extension!!)
  This file is dynamically loading the data from the main config, so it shouldn't be maintained separately
*/
const loadConfig = require('./src/config/index').loadConfig;
const env = process.env.NODE_ENV || 'development';

module.exports = {
  [env]: loadConfig().db,
};
