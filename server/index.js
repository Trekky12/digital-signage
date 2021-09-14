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

const ClientGroup = require('./models/clientgroup.model');
const Slideshow = require('./models/slideshow.model');

const app = express();

// WebSocket
const wss = new WebSocket.Server({ port: 3001 })
wss.on('connection', function connection(ws, req) {
    const parameters = url.parse(req.url, true);
    const group = parameters.query.group;
    const type = parameters.query.type;
    const initial = (parameters.query.initial == 'true');

    const ip = req.socket.remoteAddress;

    // create an random id for the client to send/get data
    ws.info = {
        id : crypto.randomBytes(16).toString("hex"),
        ip : ip
    }

    if (type == "client") {
        ClientGroup.findOrCreate({
            where: { 
                name: group
            },
            defaults: {
                ip: ip,
                url: '#'
            }
        }).then(async function ([clientgroup, created]) {
            if (created) {
                console.log("Created new Client Group: ", clientgroup.name)
            } else {
                console.log("Found matching Client Group: ", clientgroup.name);
                /*client.ip = ip;
                client.save();*/

                // send saved slideshow
                if (initial && clientgroup.slideshowId !== null) {
                    console.log("Initially sending of slideshow");
                    let slideshow = await Slideshow.findByPk(clientgroup.slideshowId, { include: ["slides"] });
                    ws.send(JSON.stringify({ "type": "send_url", "slideshow": slideshow }));
                    ws.info.lastSend = new Date();
                }

                // if not initial? whats the date of the submitted slideshow? get from client!
            }
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
                        client.send(JSON.stringify({ "type": "get_url_result", "url": data.url }));
                    }
                }
            });
        }
    });
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