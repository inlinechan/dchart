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
        socket.emit('data', parse(line));
    }
});

app.get('/', function(req, res) {
    res.redirect('/tran.html');
});

app.use(express.static('public'));

http.listen(3000, function() {
    console.log('listening on *:3000');
});

var parse = function(line) {
    var values = line.split(' ');
    var keys = ['id', 'age', 'cost', 'size'];
    var data = keys.reduce(function(o, v, i) {
        o[v] = parseInt(values[i]);
        return o;
    }, {});
    return data;
};

if (process.argv.length > 2) {
    parse = eval(process.argv[2]);
    console.log('parse: ' + parse);
}
