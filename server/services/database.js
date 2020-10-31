'use strict';

const config = require('./../config'),
      Sequelize = require('sequelize');

module.exports = new Sequelize(config.db);