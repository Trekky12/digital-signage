'use strict'; 

var Sequelize = require('sequelize');

var db = require('../services/database');

var modelDefinition = {
	id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false
    },
    duration: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    position: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
};

var SlideModel = db.define('slide', modelDefinition);

module.exports = SlideModel;