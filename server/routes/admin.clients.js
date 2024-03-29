'use strict';

const express = require('express'),
    WebSocket = require('ws'),
    router = express.Router(),
    ClientGroup = require('../models/clientgroup.model'),
    Slideshow = require('../models/slideshow.model'),
    Slide = require('../models/slide.model'),
    Ticker = require('../models/ticker.model'),
    moment = require('moment');

module.exports = function (wss) {

    router.get('/', async function (req, res) {
        const wss_clients = []
        wss.clients.forEach(function (client) {
            wss_clients.push(client.info);
        });

        const slideshows = await Slideshow.findAll();
        const tickers = await Ticker.findAll();
        const clientGroups = await ClientGroup.findAll();

        clientGroups.forEach(function (clientgroup) {
            
            let connectedClients = wss_clients.filter(function (item) {
                if (item.group === clientgroup.id) {
                    return true;
                } else {
                    return false;
                }
            });
            clientgroup.clients = connectedClients;
            //clientgroup.clients = [];

            slideshows.forEach(function (slideshow) {
                if (clientgroup.slideshowId == slideshow.id) {
                    clientgroup.slideshow = slideshow;
                }
            });

            tickers.forEach(function (ticker) {
                if (clientgroup.tickerId == ticker.id) {
                    clientgroup.ticker = ticker;
                }
            });
        });

        return res.render('admin/clients/index', { clientgroups: clientGroups, slideshows: slideshows, tickers: tickers, moment: moment })
    });

    router.get('/clients', async function (req, res) {
        const wss_clients = []
        wss.clients.forEach(function (client) {
            wss_clients.push(client.info);
        });

        const slideshows = await Slideshow.findAll();
        const tickers = await Ticker.findAll();

        const clientGroups = await ClientGroup.findAll();
        clientGroups.forEach(function (clientgroup) {

            let connectedClients = wss_clients.filter(function (item) {
                if (item.group === clientgroup.id) {
                    return true;
                } else {
                    return false;
                }
            });
            clientgroup.clients = connectedClients;

            slideshows.forEach(function (slideshow) {
                if (clientgroup.slideshowId == slideshow.id) {
                    clientgroup.slideshow = slideshow;
                }
            });

            tickers.forEach(function (ticker) {
                if (clientgroup.tickerId == ticker.id) {
                    clientgroup.ticker = ticker;
                }
            });

        });

        return res.json(wss_clients);
    });


    router.post('/sendSlideshow', async function (req, res) {
        let clientgroup_id = req.body.group;
        let client_id = req.body.client;
        let slideshow_id = req.body.slideshow;

        let msg = "Error: Client Group not available!";

        let slideshow = await Slideshow.findByPk(slideshow_id, {
            include: [Slide],
            order: [[Slide, 'position', 'asc']]
        });

        let sendDate = new Date();

        if (slideshow === null) {
            msg = "Slideshow not found!";
        } else {
            wss.clients.forEach(function (ws_client) {
                if ((clientgroup_id !== undefined && ws_client.info.group == clientgroup_id) || (client_id !== undefined && ws_client.info.id == client_id)) {
                    if (ws_client.readyState === WebSocket.OPEN) {
                        ws_client.send(JSON.stringify({ "type": "send_slideshow", "slideshow": slideshow }));
                        ws_client.info.lastSendSlideshow = sendDate;
                        msg = "successfully send to client";

                    } else {
                        msg = 'Error Client not connected';
                    }
                }
            });

            // save new slideshow at group
            if (clientgroup_id !== undefined) {
                ClientGroup.findByPk(clientgroup_id).then(function (clientgroup) {
                    clientgroup.update({ slideshowId: slideshow_id, lastSendSlideshow: sendDate });
                });
                msg = "New slideshow saved";
            }
        }

        return res.json(msg)
    });

    router.post('/control', async function (req, res) {
        let client_id = req.body.client;
        let admin_id = req.body.admin;
        let type = req.body.type;

        let msg = "Error: Client not available!";

        if (["get_url", "reload", "ctrl_pause", "ctrl_play", "ctrl_prev", "ctrl_next"].includes(type)) {
            wss.clients.forEach(function (ws_client) {
                if (ws_client.info.id == client_id) {
                    if (ws_client.readyState === WebSocket.OPEN) {
                        ws_client.send(JSON.stringify({ "type": type, "admin": admin_id }));
                        msg = "success";
                    } else {
                        msg = 'Error Client not connected';
                    }
                }
            });
        } else {
            msg = "Command not recognized!"
        }

        return res.json(msg)
    });

    router.post('/sendTicker', async function (req, res) {
        let clientgroup_id = req.body.group;
        let client_id = req.body.client;
        let ticker_id = req.body.ticker;

        let msg = "Error: Client Group not available!";

        let ticker = await Ticker.findByPk(ticker_id);

        // no ticker found or "None" selected
        if (ticker === null) {
            ticker_id = null;
        }

        let sendDate = new Date();
        wss.clients.forEach(function (ws_client) {
            if ((clientgroup_id !== undefined && ws_client.info.group == clientgroup_id) || (client_id !== undefined && ws_client.info.id == client_id)) {
                if (ws_client.readyState === WebSocket.OPEN) {
                    ws_client.send(JSON.stringify({ "type": "send_ticker", "ticker": ticker }));
                    ws_client.info.lastSendTicker = sendDate;
                    msg = "Ticker successfully send to client";

                } else {
                    msg = 'Error Client not connected';
                }
            }
        });

        // save new ticker at group
        if (clientgroup_id !== undefined) {
            ClientGroup.findByPk(clientgroup_id).then(function (clientgroup) {
                clientgroup.update({ tickerId: ticker_id, lastSendTicker: sendDate });
            });
            msg = "New ticker saved";
        }

        return res.json(msg)
    });

    /**
     * Delete Client group
     */
    router.get('/group/delete/:id', async function (req, res) {
        let msg = "Error when deleting!";

        let result = await ClientGroup.destroy({
            where: {
                id: req.params.id
            }
        });
        if (result > 0) {
            msg = "success";
        }
        return res.json(msg)
    });

    return router;
};