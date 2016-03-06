var id = 1;
var ymax = 1200,
    ymin = 500;
var interval = 2000;

if (process.argv.length > 2)
    id = parseInt(+process.argv[2]);

if (process.argv.length > 3)
    interval = parseInt(+process.argv[3]);

setTimeout(function() {
    setInterval(function() {
        var keys = ['age', 'cost', 'size'];
        var values = [
            ymin + (Math.random() * (ymax - ymin)),
            100 + (Math.random() * (600 - 100)),
            300 + (Math.random() * (600 - 100))
        ];
        values = values.map(function(e) { return parseInt(e); });
        console.log(id + ' ' + values.join(' '));
        id += 1;
    }, interval);
}, 2000);
