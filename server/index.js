'use strict';

if (typeof (PhusionPassenger) !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
}

const express = require('express'),
    bodyParser = require('body-parser'),
    WebSocket = require('ws'),
    url = require('url'),
    path = require('path');

const Client = require('./models/client.model');
const Slideshow = require('./models/slideshow.model');

const app = express();

// WebSocket
const wss = new WebSocket.Server({ port: 3001 })
wss.on('connection', function connection(ws, req) {
    const parameters = url.parse(req.url, true);
    const hostname = parameters.query.hostname;
    const type = parameters.query.type;

    const ip = req.socket.remoteAddress;

    if (type == "client") {
        Client.findOrCreate({
            where: { hostname: hostname },
            defaults: {
                ip: ip,
                url: '#'
            }
        }).then(async function ([client, created]) {
            if (created) {
                console.log("Created Client: ", client.hostname)
            } else {
                console.log("Found Client: ", client.hostname);
                client.ip = ip;
                client.save();

                if (client.slideshowId !== null) {
                    let slideshow = await Slideshow.findByPk(client.slideshowId, { include: ["slides"] });
                    // send last url
                    ws.send(JSON.stringify({ "type": "send", "slideshow": slideshow }));
                }
            }
            ws.id = client.id;
        });
    }

    ws.on('message', message => {
        console.log(`Received message => ${message}`);
        let data = JSON.parse(message);
        console.log(message);
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