var fs = require('fs'),
    d3 = require('d3');

var schema = 'number.json';

if (process.argv.length > 2)
    schema = process.argv[2];

if (fs.statSync(schema).isFile()) {
    schema = fs.readFileSync(schema);
    schema = JSON.parse(schema);
}
console.log('schema: ' + schema.columns);

function getGenerator(schema) {
    var schema_ = schema,
        current = null,
        initial = 1,
        last = 10;

    schema_.columns.forEach(function(e) {
        if (e.x) {
            if (e.initial) {
                if (e.type == 'number')
                    initial = e.initial;
                else if(e.type == 'time')
                    initial = new Date(e.initial).getTime();
            }
            if (e.last) {
                if (e.type == 'number')
                    last = e.last;
                else if(e.type == 'time')
                    last = new Date(e.last).getTime();
            }
        }
    });
    var next = initial;

    var generator = function() {
        var initial = 1;
        var day = 60 * 60 * 24 * 1000,
            second = 1 * 1000,
            minute = 60 * 1000,
            hour = 60 * 60 * 1000;

        var increment = null;
        var defaultIncrement = {
            'number': 1,
            'time': second
        };

        if (current == last)
            return null;

        var data = schema_.columns.reduce(function(o, v, i) {
            v.type = v.type || 'number';

            if (v.x)
                increment = v.increment || defaultIncrement[v.type];

            switch(v.type) {
            case 'number':
                if (v.x) {
                    current = next;
                    next = next + increment;
                    o[v.name] = current;
                } else {
                    o[v.name] = parseInt(v.range[0] + Math.random() * (v.range[1] - v.range[0]));
                }
                break;

            case 'time':
                if (v.x) {
                    current = next;
                    next = next + increment;
                    o[v.name] = d3.time.format(v.format)(new Date(current));
                } else {
                    o[v.name] = d3.time.format(v.format)(new Date(current));
                }
                break;
            }
            return o;
        }, {});
        return data;
    };

    return generator;
}

var interval = 2000;

setTimeout(function() {
    var generator = getGenerator(schema);

    var intervalId = setInterval(function() {
        var o = generator();
        if (!o) {
            clearInterval(intervalId);
            return;
        }

        var values = [];
        for (var key in o) {
            values.push(o[key]);
        }
        console.log(values.join(' '));
    }, interval);
}, 1000);
