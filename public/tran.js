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

    var initialMinDomainX = null;
    var xRange = 10;

    var getX = null,
        getY = function(d) { return d.value; };

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

            var container = svg.append("g").attr("class", "container")
                    .attr("clip-path", "url(#clip)");

            var transContainer = container.append("g").attr("class", "transContainer");
            var lineContainer = transContainer.append("g").attr("class", "lineContainer");
            var dotContainer = transContainer.append("g").attr("class", "dotContainer");

            svg.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

            x.range([0, width])
                .domain(d3.extent(data, getX));

            initialMinDomainX = getX(firstElement(x.domain()));
            // y.domain(d3.extent(data, function(d) { return d.value; }));
            // TODO: calculate y domain
            y.range([height, 0])
                .domain([0, 1200]);

            var axisContainer = svg.append("g");

            axisContainer.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            axisContainer.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Price ($)");

            lineContainer.selectAll(".line")
                .data(series)
                .enter()
                .append("path")
                .attr("class", "line")
                .style("stroke", function(d) { return color(d.name); })
                .attr("d", function(d) { return line(d.values); });

            var dots = [];
            color.domain().forEach(function(name) {
                data.forEach(function(d) {
                    dots.push({name: name, id: d.id, value: +d[name]});
                });
            });
            // console.log(dots);

            var circles = dotContainer.selectAll(".circle")
                    .data(dots)
                    .enter()
                    .append("circle")
                    .transition()
                    .attr({
                        class: "circle",
                        fill: function(d, i) { return color(d.name); },
                        cx: function(d, i) { return x(getX(d)); },
                        cy: function(d, i) { return y(getY(d)); },
                        r: 5});

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

            var svg = d3.select(this).select("svg").select("g");

            var transContainer = svg.select(".transContainer");
            var lineContainer = transContainer.select(".lineContainer");
            var dotContainer = transContainer.select(".dotContainer");
            var path = lineContainer.selectAll(".line");
            var translateX = 0;

            var dots = [];
            data.forEach(function(line) {
                line.values.forEach(function(item) {
                    dots.push({name: line.name, id: item.id, value: +item.value});
                });
            });

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
                        .attr("d", function(d) { return line(d.values); });

                    dotContainer.selectAll(".circle").data([]).exit().remove();
                    var circles = dotContainer.selectAll(".circle")
                            .data(dots);

                    transContainer
                        .attr("transform", null);

                    var xTranslateOffset = -1 * x(initialMinDomainX + currentX - lastX);

                    circles
                        .enter()
                        .append("circle")
                        .attr({
                            class: "circle",
                            fill: function(d, i) { return color(d.name); },
                            opacity: 1.0,
                            cx: function(d, i) { return x(getX(d)); },
                            cy: function(d, i) { return y(getY(d)); },
                            r: 5});

                    transContainer
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

                dots = [];
                data.forEach(function(line) {
                    line.values.forEach(function(item) {
                        dots.push({name: line.name, id: item.id, value: +item.value});
                    });
                });
                console.log(dots);

                dotContainer.selectAll(".circle").data([]).exit().remove();
                var circles = dotContainer.selectAll(".circle")
                        .data(dots);

                svg.select(".x.axis")
                    .transition()
                    .call(xAxis)
                    .each("end", function() {
                        circles
                            .enter()
                            .append("circle")
                            .attr({
                                class: "circle",
                                fill: function(d, i) { return color(d.name); },
                                cx: function(d, i) { return x(getX(d)); },
                                cy: function(d, i) { return y(getY(d)); },
                                r: 5,
                                opacity: 0.0
                            })
                            .transition()
                            .attr("opacity", 1.0);
                    });

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
        var values = line.split(/\s+/);
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
            getX = function(d) { return +d[name]; };
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
        e.type = e.type || 'number';
        if ('x' in e)
            x = scales[e.type]();
        else
            y = scales[e.type]();
    });
    return {x: x, y: y};
};
