var express = require('express');
var app = express();
var http = require('http').Server(app);

var readline = require('readline');
var io = require('socket.io')(http);

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var sockets = {};
io.on('connection', function(socket) {
    var id = socket.id;
    console.log('a user connected: ' + id);
    sockets[id] = socket;
    socket.on('disconnect', function() {
        console.log('a user disconnected: ' + id);
        delete sockets[id];
    });
});

rl.on('line', (line) => {
    console.log(`> ${line}`);
    for (var id in sockets) {
        var socket = sockets[id];
        socket.emit('data', line);
    }
});

app.get('/', function(req, res) {
    res.redirect('/tran.html');
});

app.use(express.static('public'));

http.listen(3000, function() {
    console.log('listening on *:3000');
});
