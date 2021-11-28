'use strict';

var Sequelize = require('sequelize');

var db = require('../services/database');

var modelDefinition = {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    text: {
        type: Sequelize.TEXT
    },
    lastChange: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
};

var TickerModel = db.define('ticker', modelDefinition);

module.exports = TickerModel;