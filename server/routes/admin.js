'use strict'; 

const express = require('express'),
    basicAuth = require('express-basic-auth'),
    config = require('../config'),
    router = express.Router();


module.exports = function(wss) {

  router.use(basicAuth({
      users: config.adminusers,
      challenge: true,
      realm: 'Admin',
  }));
  
  router.use(express.static('public/admin'));

  router.use('/', require('./admin.clients')(wss));
  router.use('/slideshows', require('./admin.slideshows'));
  router.use('/tickers', require('./admin.tickers'));

  return router;
}