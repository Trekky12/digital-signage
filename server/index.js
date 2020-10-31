'use strict';

if (typeof(PhusionPassenger) !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
}

const express = require('express'),
    basicAuth = require('express-basic-auth'),
    bodyParser = require('body-parser'),
    sequelize = require('sequelize'),
    WebSocket = require('ws'),
    url = require('url');
    
const config = require('./config');

const Client = require('./models/client.model');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database
const db = require('./services/database');
db.authenticate().then(() => {
    console.log('Connection to the database has been established.');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

// Routes
app.use(express.static('public/client'));

const router = express.Router();

router.use(basicAuth({
    users: config.adminusers,
    challenge: true,
    realm: 'Admin',
}));

router.use(express.static('public/admin'));

router.get('/clients', function(req, res) {
    const wss_clients = []
    wss.clients.forEach(function(client){
        wss_clients.push(client.id);
    })
    
    Client.findAll().then(function (clients){
        let clients2 = [];
        clients.forEach(function (client){
            let client2 = client.get({plain: true});
            client2.isAvailable = wss_clients.includes(client.id);
            clients2.push(client2);
        })
        
        return res.json(clients2);
    }).catch(function (err){
        return res.status(400).json('Error: ' + err);
    });
        
});

router.post('/send', function(req, res) {   
    let client_id = req.body.client;
    let url = req.body.url;
    
    let msg = "error";
    
    wss.clients.forEach(function (client){
        if(client.id == client_id){
            if(client.readyState === WebSocket.OPEN){
                let cmd = {"type": "send", "msg": url};
                client.send(JSON.stringify(cmd));
                
                msg = "success";
                
            }else{
                msg = 'Error Client not connected';
            }
        }
    });
    
    if(msg == "success"){
        Client.findByPk(client_id).then(function (client){
            client.update({url:url});
        });
    }
    
    return res.json(msg)
});

app.use('/admin', router);


// WebSocket
const wss = new WebSocket.Server({ port: 3001 })
 
wss.on('connection', function connection(ws, req){
    const parameters = url.parse(req.url, true);
    const hostname = parameters.query.hostname;
    const type = parameters.query.type;
    
    const ip = req.socket.remoteAddress;
    
    if(type == "client"){
        Client.findOrCreate({
            where: {hostname: hostname},
            defaults: {
                ip: ip,
                url: '#' 
            }
        }).then(function([client, created]) {
            if(created){
                console.log("Created Client: ", client.hostname)
            }else{
                console.log("Found Client: ", client.hostname);
                client.ip = ip;
                client.save();
            }
            ws.id = client.id;
            
            // send last url
            ws.send(JSON.stringify({"type": "send", "msg": client.url}));
        });
    }
  
  ws.on('message', message => {
    console.log(`Received message => ${message}`);
    let data = JSON.parse(message);
    console.log(message);
  });
});

if (typeof(PhusionPassenger) !== 'undefined') {
    app.listen('passenger', serverStart);
} else {
    app.listen(8080, serverStart);
}

function serverStart(){
    console.log('Magic happens at http://localhost:8080/! We are all now doomed!');
    
    db.sync();
    //db.sync({force: true});
}