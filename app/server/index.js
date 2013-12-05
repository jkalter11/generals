// import the express module which provides us
// a basic framework to work on top of node
var express = require('express');

// Import HTTP module to create our own HTTP server
var http = require('http');

// Create a new Express application
var app = express();

// the port number shall depend on the environment variable PORT
// if available, if not, let's use 3000
var server = app.listen(process.env.PORT || 3000);

// Create a Socket.IO server and attach it to the HTTP server
var io = require('socket.io').listen(server);

// Import our router module (which basically just serves our client files)
var router = require('./router.js');

// And finally, let's import our game controller
var controller = require('./controller.js');

// Configure express: serve all files under the client folder to be static
app.use(express.static('app/public'));

// Now, let's handle application requests
router.handle(app, controller);

// We don't want to listen "too much" from Socket.IO logs
io.enable('browser client minification');
io.set('log level', 1);

// Then, let's listen for connections.
// Once we receive one, start the game logic
controller.init(io);
io.sockets.on('connection', controller.handle);

// Finally, for unit testing, we will expose our the server
exports.server = server;
