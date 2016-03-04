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

    var lastElement = function(ar) {
        return ar[ar.length - 1];
    };

    var firstElement = function(ar) {
        return ar[0];
    };

    function chart(selection) {
        selection.each(function(data) {
            var svg = d3.select(this).selectAll("svg").data([data]);

            var gEnter = svg.enter().append("svg").append("g");

            svg.attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            gEnter.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
            gEnter.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

            x.range([0, width])
                .domain(d3.extent(data, getX));

            initialMinDomainX = firstElement(x.domain());
            // y.domain(d3.extent(data, function(d) { return d.value; }));
            y.range([height, 0])
                .domain([500, 1200]);

            gEnter.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            gEnter.append("g")
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
                .datum(data)
                .attr("class", "line")
                .attr("d", line);
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

            newData = [].concat(newData);

            var svg = d3.select(this); // .select("svg");
            var path = svg.select(".line");
            var translateX = 0;

            var oldData = data;
            data = data.concat(newData);

            if (oldData == data)
                console.error('data same!');

            if (data.length > xRange) {
                var transition = d3.select({}).transition()
                        .duration(500);

                transition = transition.each(function() {
                    var lastX = getX(lastElement(oldData));
                    var currentX = getX(lastElement(newData));

                    initialMinDomainX = getX(firstElement(oldData));

                    console.log(data.map(getX));
                    console.log(data.map(function(d) { return d.value; }));
                    // console.log(line(data));

                    // x.domain(d3.extent(data, getX));

                    path
                        .datum(data)
                        .attr("d", line)
                        .attr("transform", null);

                    translateX = currentX - lastX;

                    var xTranslateOffset = -1 * x(initialMinDomainX + translateX);

                    path
                        .transition()
                        .attr("transform", "translate(" + xTranslateOffset + ")")
                        .each("end", function() {
                            // path
                            selection
                                .datum(data)
                                .attr("d", line)
                                .attr("transform", null);
                        });

                    data.splice(0, newData.length);

                    x.domain(d3.extent(data, getX));
                    // console.log('domain: ' + data.map(getX));
                    // console.log(data.map(function(d) { return d.value; }));

                    svg.select(".x.axis").call(xAxis);
                    svg.select(".y.axis").call(yAxis);
                });
            } else {
                x.domain(d3.extent(data, getX));
                path
                    .datum(data)
                    .transition()
                    .attr("d", line);

                selection.datum(data);

                x.domain(d3.extent(data, getX));
                console.log('domain: ' + data.map(getX));
                console.log(data.map(function(d) { return d.value; }));

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
