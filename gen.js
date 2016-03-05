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
        var value = ymin + (Math.random() * (ymax - ymin));
        var cost = ymin + (Math.random() * (ymax - ymin));
        console.log(id + ' ' + parseInt(value) + ' ' + parseInt(cost));
        id += 1;
    }, interval);
}, 2000);
