'use strict';

const express = require('express'),
    WebSocket = require('ws'),
    router = express.Router(),
    Client = require('../models/client.model'),
    Slideshow = require('../models/slideshow.model');

module.exports = function (wss) {

    router.get('/', async function (req, res) {
        const wss_clients = []
        wss.clients.forEach(function (client) {
            wss_clients.push(client.id);
        });

        const savedClients = await Client.findAll();
        let clients = [];
        savedClients.forEach(function (client) {
            let client2 = client.get({ plain: true });

            client2.clientCount = wss_clients.filter(function (item) {
                if (item === client.id) {
                    return true;
                } else {
                    return false;
                }
            }).length;

            clients.push(client2);
        });

        const slideshows = await Slideshow.findAll();

        return res.render('admin/clients/index', { clients: clients, slideshows: slideshows })
    });


    router.post('/sendURL', async function (req, res) {
        let client_id = req.body.client;
        let slideshow_id = req.body.slideshow;

        let msg = "Error: Client not available!";

        let slideshow = await Slideshow.findByPk(slideshow_id, { include: ["slides"] });

        if (slideshow === null) {
            msg = "Slideshow not found!";
        } else {
            wss.clients.forEach(function (client) {
                if (client.id == client_id) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ "type": "send_url", "slideshow": slideshow }));
                        msg = "success";
                    } else {
                        msg = 'Error Client not connected';
                    }
                }
            });

            if (msg == "success") {
                Client.findByPk(client_id).then(function (client) {
                    client.update({ slideshowId: slideshow_id });
                });
            }
        }

        return res.json(msg)
    });

    router.post('/getURL', async function (req, res) {
        let client_id = req.body.client;
        let admin_id = req.body.admin;

        let msg = "Error: Client not available!";

        wss.clients.forEach(function (client) {
            if (client.id == client_id) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ "type": "get_url", "admin": admin_id }));
                    msg = "success";
                } else {
                    msg = 'Error Client not connected';
                }
            }
        });

        return res.json(msg)
    });

    return router;
};