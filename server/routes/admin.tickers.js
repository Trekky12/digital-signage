'use strict';

const express = require('express'),
    router = express.Router(),
    Ticker = require('../models/ticker.model');


router.get('/', function (req, res) {
    return Ticker.findAll().then(function (tickers) {
        return res.render('admin/tickers/index', { tickers: tickers });
    })
});

router.get('/create', function (req, res) {
    return res.render('admin/tickers/edit');
});

router.post('/create', async function (req, res) {
    let name = req.body.name;
    let text = req.body.text;

    const ticker = await Ticker.create({
        name: name,
        text: text
    });

    return res.redirect('/admin/tickers/')
});

router.get('/edit/:id', async function (req, res) {
    const ticker = await Ticker.findByPk(req.params.id);
    if (ticker !== null) {
        return res.render('admin/tickers/edit', { entry: ticker });
    }
    return res.redirect('/admin/tickers/')
});
router.post('/edit/:id', async function (req, res) {

    let tickerID = req.params.id;
    let name = req.body.name;
    let text = req.body.text;

    const ticker = await Ticker.findByPk(tickerID);
    if (ticker !== null) {
        await ticker.update({
            name: name,
            text: text,
            lastChange: new Date()
        })
    }

    return res.redirect('/admin/tickers/')
});

router.get('/delete/:id', async function (req, res) {
    let msg = "Error when deleting!";

    let result = await Ticker.destroy({
        where: {
            id: req.params.id
        }
    });
    if (result > 0) {
        msg = "success";
    }
    return res.json(msg)
});



module.exports = router;