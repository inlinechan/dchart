var fs = require('fs');

var schema = 'schema.json';

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
            if (e.initial)
                initial = e.initial;
            if (e.last)
                last = e.last;
        }
    });
    var next = initial;

    var generator = function() {
        var initial = 1;
        var increment = 1;

        if (current == last)
            return null;

        var data = schema_.columns.reduce(function(o, v, i) {
            v.type = v.type || 'number';

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
            // TODO
            // case 'time':
            //     o[v.name] = d3.time.format(v.format).parse(values[i]);
            //     break;
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
