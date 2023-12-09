var width = 960,
    size = 230,
    padding = 20;

var x = d3.scale.linear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scale.linear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(6);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(6);

var color = d3.scale.category10();

d3.csv("Spotify_Youtube.csv", function(error, data) {
  if (error) throw error;

  var traits = ['danceability', 'energy', 'key', 'loudness', 'valence', 'tempo', 'duration_ms', 'views', 'interactions', 'streams'];

  var domainByTrait = {};
  traits.forEach(function(trait) {
    domainByTrait[trait] = d3.extent(data, function(d) { return +d[trait]; });
  });

  xAxis.tickSize(size * traits.length);
  yAxis.tickSize(-size * traits.length);

  var svg = d3.select("body").append("svg")
      .attr("width", size * traits.length + padding)
      .attr("height", size * traits.length + padding)
    .append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

  svg.selectAll(".x.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + i * size + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

  svg.selectAll(".y.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

  var cell = svg.selectAll(".cell")
      .data(cross(traits, traits))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + d.i * size + "," + d.j * size + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) { return d.x; });

  function plot(p) {
    var cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("cx", function(d) { return x(+d[p.x]); })
        .attr("cy", function(d) { return y(+d[p.y]); })
        .attr("r", 4)
        .style("fill", function(d) { return color(d.species); });
  }

  function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
  }

  var brush = svg.selectAll(".brush")
      .data(traits)
    .enter().append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(d3.svg.brush()
            .x(x)
            .y(y)
            .on("brush", brushmove)
            .on("brushend", brushend));
      })
    .selectAll("rect")
      .attr("x", padding / 2)
      .attr("y", padding / 2)
      .attr("width", size - padding)
      .attr("height", size - padding);

  function brushmove() {
    var actives = traits.filter(function(d) {
      return !y[d].brush.empty();
    });

    var extents = actives.map(function(d) {
      return y[d].brush.extent();
    });

    cell.selectAll("circle")
      .attr("class", function(d) {
        return actives.every(function(p, i) {
          return extents[i][0] <= d[p] && d[p] <= extents[i][1];
        }) ? "" : "hidden";
      });
  }

  function brushend() {
    if (d3.event.selection === null) {
      cell.selectAll(".hidden")
        .classed("hidden", false);
    }
  }

});
