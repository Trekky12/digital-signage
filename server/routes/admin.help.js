'use strict';

const express = require('express'),
    router = express.Router();


router.get('/', function (req, res) {
    return res.render('admin/help');
});

module.exports = router;