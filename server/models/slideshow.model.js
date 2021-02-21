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
    }
};

var SlideshowModel = db.define('slideshow', modelDefinition);

/**
 * 1:n relationship between slideshow and slide
 */
var Slide = require('./slide.model');
SlideshowModel.hasMany(Slide, { 
    as: "slides",
    onDelete: 'cascade', 
    foreignKey: { 
        allowNull: false 
    },
    hooks: true
});


module.exports = SlideshowModel;