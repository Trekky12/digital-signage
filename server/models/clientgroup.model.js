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
    lastSendSlideshow: {
        type: Sequelize.DATE
    },
    lastSendTicker: {
        type: Sequelize.DATE
    }
};

var ClientGroupModel = db.define('clientgroup', modelDefinition);

var SlideshowModel = require('./slideshow.model');
ClientGroupModel.belongsTo(SlideshowModel);

var TickerModel = require('./ticker.model');
ClientGroupModel.belongsTo(TickerModel);

module.exports = ClientGroupModel;