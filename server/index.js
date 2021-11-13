'use strict';

if (typeof (PhusionPassenger) !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
}

const express = require('express'),
    bodyParser = require('body-parser'),
    WebSocket = require('ws'),
    url = require('url'),
    path = require('path'),
    crypto = require("crypto");

const ClientGroup = require('./models/clientgroup.model'),
    Slideshow = require('./models/slideshow.model'),
    Slide = require('./models/slide.model');

const app = express();

// WebSocket
const wss = new WebSocket.Server({ port: 3001 })
wss.on('connection', function connection(ws, req) {
    const parameters = url.parse(req.url, true);
    const group = parameters.query.group;
    const type = parameters.query.type;
    const initial = (parameters.query.initial == 'true');
    const hostname = parameters.query.hostname ? parameters.query.hostname : null;
    const cid = parameters.query.cid ? parameters.query.cid : null;

    const ip = req.socket.remoteAddress;

    // create an random id for the client to send/get data
    ws.info = {
        id: crypto.randomBytes(16).toString("hex"),
        ip: ip,
        hostname: hostname,
        cid: cid
    }

    if (type == "client") {
        ClientGroup.findOrCreate({
            where: {
                name: group
            }
        }).then(async function ([clientgroup, created]) {
            if (created) {
                console.log("Created new Client Group: ", clientgroup.name)
            } else {
                console.log("Found matching Client Group: ", clientgroup.name);

                // send saved slideshow
                if (initial && clientgroup.slideshowId !== null) {
                    console.log("Initially sending of slideshow");
                    let slideshow = await Slideshow.findByPk(clientgroup.slideshowId, {
                        include: [Slide],
                        order: [[Slide, 'position', 'asc']]
                    });
                    ws.send(JSON.stringify({ "type": "send_url", "slideshow": slideshow }));
                    ws.info.lastSend = new Date();
                }
            }

            // Client connected!
            console.log("client connected!");

            ws.info.group = clientgroup.id;
        });
    }
    if (type == "admin") {
        ws.send(JSON.stringify({ "type": "id", "id": ws.id }));
    }

    ws.on('message', message => {
        console.log(`Server received message => ${message}`);
        let data = JSON.parse(message);

        if (data.type == "get_url_result") {
            // send the retrieved url to the admin which requested it
            wss.clients.forEach(function (client) {
                if (client.id == data.admin) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ "type": "get_url_result", "value": data.value }));
                    }
                }
            });
        }

        // when a connection is restored the client sends the last date of the sended slideshow
        if (data.type == "get_last_send_result") {
            ws.info.lastSend = new Date(data.value);
        }
    });

    // on pong message set client alive
    ws.isAlive = true;
    ws.on('pong', function(){
        this.isAlive = true;
    });
});

// regulary send pings to clients
const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        // automatic handling
        ws.ping();
        // send hearbeat to client
        ws.send(JSON.stringify({ "type": "heartbeat" }));
    });
}, 30000);

wss.on('close', function close() {
    clearInterval(interval);
});

// Database
const db = require('./services/database');
db.authenticate().then(() => {
    console.log('Connection to the database has been established.');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});


// Bootstrap
app.set('view engine', 'ejs')

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/sortablejs')))

// Routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public/client'));
app.use('/admin', require('./routes/admin')(wss));


/**
 * Start server
 */
if (typeof (PhusionPassenger) !== 'undefined') {
    app.listen('passenger', serverStart);
} else {
    app.listen(8080, serverStart);
}

function serverStart() {
    console.log('Magic happens at http://localhost:8080/! We are all now doomed!');

    db.sync();
    //db.sync({force: true});
}