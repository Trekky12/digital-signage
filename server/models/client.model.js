'use strict'; 

var Sequelize = require('sequelize');

var config = require('../config'),
    db = require('../services/database');

var modelDefinition = {
	id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
	},
    hostname: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    ip: {
        type: Sequelize.STRING,
        allowNull: true
    },
    url: {
        type: Sequelize.STRING,
        allowNull: true
    }
};

var ClientModel = db.define('client', modelDefinition);

module.exports = ClientModel;