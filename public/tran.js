function lineChart() {
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear();
    var y = d3.scale.linear();

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

            var cities = color.domain().map(function(name) {
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

            var gEnter = svg.selectAll(".city")
                    .data(cities)
                    .enter()
                    .append("g")
                    .attr("class", "city");

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

            selection.data([cities]);
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

    chart.update = function(selection, newData) {
        selection.each(function(data, index) {
            console.log('data: ' + JSON.stringify(data));
            console.log('newdata: ' + JSON.stringify(newData));

            var dataLength = data.length;
            data.forEach(function(e) {
                var name = e.name;
                var values = e.values;
                var o = {id: newData.id, value: newData[name]};
                values.push(o);
            });
            console.log('data: ' + JSON.stringify(data));

            var svg = d3.select(this);
            var path = svg.selectAll(".line");
            var translateX = 0;

            if (data.length > xRange) {
                var transition = d3.select({}).transition()
                        .duration(500);

                transition = transition.each(function() {
                    var values = data[0].values;
                    var lastX = getX(lastElement(values, 2));
                    var currentX = getX(lastElement(values));

                    initialMinDomainX = getX(firstElement(values));

                    console.log(data.map(getX));
                    console.log(data.map(function(d) { return d.value; }));
                    // console.log(line(data));

                    // x.domain(d3.extent(data, getX));

                    path
                        .data(data)
                        // .style("stroke", function(d) { return color(d.name); })
                        .attr("d", function(d) { return line(d.values); })
                        .attr("transform", null);

                    translateX = currentX - lastX;

                    var xTranslateOffset = -1 * x(initialMinDomainX + translateX);

                    path
                        .transition()
                        .attr("transform", "translate(" + xTranslateOffset + ")")
                        .each("end", function() {
                            // path
                            selection
                                .data([data])
                                .attr("d", function(d) {
                                    if (d.values == undefined)
                                        console.log(d.values);
                                    return line(d.values);
                                })
                                .attr("transform", null);
                        });

                    data.splice(0, newData.length);

                    selection.data([data]);

                    x.domain(d3.extent(data, getX));
                    // console.log('domain: ' + data.map(getX));
                    // console.log(data.map(function(d) { return d.value; }));

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

                x.domain(d3.extent(data[0].values, getX));
                data.forEach(function(e) {
                    console.log('domain: ' + e.values.map(getX));
                    console.log('values: ' + e.values.map(getY));
                });

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
