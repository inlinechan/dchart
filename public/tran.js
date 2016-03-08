function lineChart(scales) {
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = scales.x || d3.scale.linear();
    var y = scales.y || d3.scale.linear();

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

    var color = d3.scale.category10();

    var line = d3.svg.line()
            .x(function(d) { return x(getX(d)); })
            .y(function(d) { return y(getY(d)); });

    var initialMinDomainX = 1;
    var xRange = 10;

    var getX = function(d) {
        return d.id;
    };

    var getY = function(d) {
        return d.value;
    };

    var lastElement = function(ar, dist) {
        if (dist == undefined)
            dist = 1;
        return ar[ar.length - dist];
    };

    var firstElement = function(ar) {
        return ar[0];
    };

    function chart(selection) {
        selection.each(function(data) {
            var keys = d3.keys(data[0]);
            keys.splice(0, 1);
            color.domain(keys);

            var series = color.domain().map(function(name) {
                return {
                    name: name,
                    values: data.map(function(d) {
                        return {id: d.id, value: +d[name]};
                    })
                };
            });

            var svg = d3.select(this).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

            var gEnter = svg.selectAll(".item")
                    .data(series)
                    .enter()
                    .append("g")
                    .attr("class", "item");

            gEnter.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

            x.range([0, width])
                .domain(d3.extent(data, getX));

            initialMinDomainX = firstElement(x.domain());
            // y.domain(d3.extent(data, function(d) { return d.value; }));
            // TODO: calculate y domain
            y.range([height, 0])
                .domain([100, 1200]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Price ($)");

            gEnter.append("g")
                .attr("clip-path", "url(#clip)")
                .append("path")
                .attr("class", "line")
                .style("stroke", function(d) { return color(d.name); })
                .attr("d", function(d) { return line(d.values); });

            selection.data([series]);
        });
    };

    chart.xAxis = function() {
        return xAxis;
    };

    chart.yAxis = function() {
        return yAxis;
    };

    chart.width = function(value) {
        if (!arguments.length) return value;
        width = value - margin.left - margin.right;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return value;
        height = value - margin.top - margin.bottom;
        return chart;
    };

    chart.getX = function(func) {
        if (!arguments.length) return func;
        getX = func;
        return chart;
    };

    chart.update = function(selection, newData) {
        selection.each(function(data, index) {
            // console.log('data: ' + JSON.stringify(data));
            // console.log('newdata: ' + JSON.stringify(newData));

            var dataLength = data.length;
            data.forEach(function(e) {
                var name = e.name;
                var values = e.values;
                values.push({id: newData.id, value: newData[name]});
            });
            // console.log('data: ' + JSON.stringify(data));

            var svg = d3.select(this);
            var path = svg.selectAll(".line");
            var translateX = 0;

            if (data[0].values.length > xRange) {
                var transition = d3.select({}).transition()
                        .duration(500);

                transition = transition.each(function() {
                    var values = data[0].values;
                    var lastX = getX(lastElement(values, 2));
                    var currentX = getX(lastElement(values));

                    initialMinDomainX = getX(firstElement(values));

                    // console.log(values.map(getX));
                    // console.log(values.map(getY));

                    path
                        .data(data)
                        .attr("d", function(d) { return line(d.values); })
                        .attr("transform", null);

                    translateX = currentX - lastX;

                    var xTranslateOffset = -1 * x(initialMinDomainX + translateX);

                    path
                        .transition()
                        .attr("transform", "translate(" + xTranslateOffset + ")");

                    data.forEach(function(e) {
                        e.values.splice(0, 1);
                    });

                    selection.data([data]);

                    x.domain(d3.extent(data[0].values, getX));

                    svg.select(".x.axis").call(xAxis);
                    svg.select(".y.axis").call(yAxis);
                });
            } else {
                x.domain(d3.extent(data[0].values, getX));
                path
                    .data(data)
                    .transition()
                    .attr("d", function(d) { return line(d.values); });

                selection.data([data]);

                // data.forEach(function(e) {
                //     console.log('domain: ' + e.values.map(getX));
                //     console.log('values: ' + e.values.map(getY));
                // });

                svg.select(".x.axis").transition().call(xAxis);
                svg.select(".y.axis").call(yAxis);
            }
        });
    };

    return chart;
}

function type(d) {
    d.id = +d.id;
    d.value = +d.value;
    return d;
}

// schema should be set first
// var schema = [
//     {name: 'id', type: 'number'},
//     {name: 'date', type: 'time', format: '%d-%b-%y'},
//     {name: 'close', type: 'number'}
// ];

function getParser(schema) {
    var schema_ = schema;

    var parser = function(line) {
        var values = line.split(' ');
        var data = schema_.reduce(function(o, v, i) {
            switch(v.type) {
            case 'number':
                o[v.name] = parseInt(values[i]);
                break;
            case 'time':
                o[v.name] = d3.time.format(v.format).parse(values[i]);
                break;
            }
            return o;
        }, {});
        return data;
    };
    return parser;
}

function parseGetX(schema) {
    var getX = null;
    schema.columns.forEach(function(e) {
        if ('x' in e) {
            var name = e['name'];
            getX = function(d) { return d[name]; };
        }
    });
    return getX;
};

function parseScale(schema) {
    var x = null,
        y = null;

    var scales = {
        'number': function() { return d3.scale.linear(); },
        'time': function() { return d3.time.scale(); }
    };
    schema.columns.forEach(function(e) {
        if ('x' in e)
            x = scales[e.type]();
        else
            y = scales[e.type]();
    });
    return {x: x, y: y};
};
