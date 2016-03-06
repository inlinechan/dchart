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
        var age = ymin + (Math.random() * (ymax - ymin));
        var cost = 100 + (Math.random() * (600 - 100));
        var size = 300 + (Math.random() * (600 - 100));
        console.log(id + ' ' + parseInt(age) + ' ' + parseInt(cost) + ' ' + parseInt(size));
        id += 1;
    }, interval);
}, 2000);
