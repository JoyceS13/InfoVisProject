var width = 1000,
    size = 300,
    padding = 40;
// Append "Show by genre" checkbox
var checkboxDiv = d3.select("body")
  .append("div");

checkboxDiv.append("input")
  .attr("type", "checkbox")
  .attr("id", "showByGenreCheckbox")
  .on("change", function() {
    // Get the checkbox value (checked or unchecked)
    var isChecked = d3.select(this).property("checked");
    // Perform actions based on the checkbox value
    console.log("Show by genre:", isChecked);
    // Implement logic to update the plots based on the checkbox value
  });

// checkboxDiv.append("label")
//   .attr("for", "showByGenreCheckbox")
//   .text("Show by genre");


  
d3.csv("../data/Spotify_Youtube.csv").then(function(data) {
    domainByTrait = {}
    data.forEach(function(d) {
        // d['Duration_mins'] = +d['Duration_ms'] / 60000; // Convert ms to mins and add a new property
        d['Interactions'] = +d['Comments'] + +d['Likes'];
    });

    var traitsX = ['Danceability', 'Energy', 'Loudness', 'Valence', 'Tempo'];
    var traitsY = ['Views', 'Stream', 'Interactions'];

    traitsX.forEach(function(traitX) {
        domainByTrait[traitX] = d3.extent(data, function(d) { return +d[traitX]; });
    });

    traitsY.forEach(function(traitY) {
        domainByTrait[traitY] = d3.extent(data, function(d) { return +d[traitY]; });
        domainByTrait[traitY][1] = domainByTrait[traitY][1];
        domainByTrait[traitY][0] = 10000;
    });

    var svg = d3.select("body").append("svg")
        .attr("width", size * traitsX.length + padding) // Adjusted width based on the number of x traits
        .attr("height", size * traitsY.length + padding) // Adjusted height based on the number of y traits
        .append("g")
        .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

    var cell = svg.selectAll(".cell")
        .data(cross(traitsY, traitsX)) // Reversed order of traitsY and traitsX for the correct layout
        .enter().append("g")
        .attr("transform", function(d, i) {
            var translateX = (i % traitsX.length) * size;
            var translateY = (traitsY.length - Math.floor(i / traitsX.length) - 1) * size;
            return "translate(" + translateX + "," + translateY + ")";
        }).each(plot);

    function plot(p) {
        var x = d3.scaleLinear()  // Change to logarithmic scale
            .range([padding, size - padding]);

        var y = d3.scaleLinear()
            .range([size - padding / 2 - 10, padding / 2]);
        var cell = d3.select(this);

        //xAxis
        var xAxis = x.domain(domainByTrait[p.x]).range([padding, size - padding]).nice();
        
        //yAxis
        var yAxis = y.domain(domainByTrait[p.y]).range([padding, size - padding]);

        // Append x-axis label
        cell.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", size / 2)
            .attr("y", size + padding / 2)
            .text(p.x);

        // Append y-axis label
        cell.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -size / 2)
            .attr("y", - padding / 2)
            .text(p.y);

        var xAx = cell.append("g")
            .attr("transform", `translate(0, ${size - padding / 3})`)
            .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format(".1")));
        var yAx = cell.append("g")
            .attr("transform", `translate(${padding / 2}, 0)`)
            .call(d3.axisLeft(y).ticks(5));

            // var color = d3.scaleSequentialLog(d3.interpolateViridis)
            // .domain([.1, 15]);
            var color = d3.scaleLinear()
              .domain([0.01, 10]) // Assuming the range of your density values
              .range(["#8ABF9C", "#F2D750"]); // Define your desired color range
          
        const densityData = d3.contourDensity()
            .x(function(d) { return x(d[p.x]); })
            .y(function(d) { return y(d[p.y]); })
            .size([size, size]) // Adjusted size for correct placement
            .bandwidth(4)
            (data);

        cell.insert("g", "g")
            .selectAll("path")
            .data(densityData)
            .enter().append("path")
            .attr("transform", "translate(" + padding + "," + padding / 2 + ")") // Adjusted translate
            .attr("d", d3.geoPath())
            .attr("fill", function(d) { return color(d.value); });
    
        
        var brush = d3.brush()
            .extent([[padding, padding], [size - padding, size - padding]])
            .on("end", brushed);
        
        
        
            // Append brush to the plot
        // const brushGroup = cell.append("g")
        //   .attr("class", "brush")
        //   .call(brush);


        cell.append("g")
            .attr("class", "brush")
            .call(brush);
      
        function brushed(event) {
          var extent = event.selection;
          if (extent) {
              var [[x0, y0], [x1, y1]] = extent;
  
              // Update x and y domains based on brush extent
              var xDomainNew = [x.invert(x0), x.invert(x1)];
              var yDomainNew = [y.invert(y0), y.invert(y1)];
  
              // Update the scales with new domains
              x.domain(xDomainNew);
              y.domain(yDomainNew);
  
              // Transition the axis to reflect the new domain
              cell.select(".x").transition().duration(1000).call(d3.axisBottom(x));
              cell.select(".y").transition().duration(1000).call(d3.axisLeft(y));
  
              // Recalculate densityData based on updated domains
              const updatedDensityData = d3.contourDensity()
                  .x(function(d) { return x(d[p.x]); })
                  .y(function(d) { return y(d[p.y]); })
                  .size([size, size])
                  .bandwidth(4)
                  (data);
  
              // Remove existing paths
              cell.selectAll("path").remove();
  
              // Enter new paths for updated density data
              cell.selectAll("path")
                  .data(updatedDensityData)
                  .enter().append("path")
                  .attr("transform", "translate(" + padding + "," + padding / 2 + ")")
                  .attr("d", d3.geoPath())
                  .attr("fill", function(d) { return color(d.value); });
          }
        
       else {
        // When there's no selection, zoom back out to original scale

        // Reset the scales to their original domains
        x.domain(domainByTrait[p.x]).nice();
        y.domain(domainByTrait[p.y]).nice();

        // Transition the axis to reflect the original domain
        cell.select(".x").transition().duration(1000).call(d3.axisBottom(x));
        cell.select(".y").transition().duration(1000).call(d3.axisLeft(y));

        // Recalculate densityData based on original domains
        const updatedDensityData = d3.contourDensity()
            .x(function(d) { return x(d[p.x]); })
            .y(function(d) { return y(d[p.y]); })
            .size([size, size])
            .bandwidth(4)
            (data);

        // Remove existing paths
        cell.selectAll("path").remove();

        // Enter new paths for updated density data
        cell.selectAll("path")
            .data(updatedDensityData)
            .enter().append("path")
            .attr("transform", "translate(" + padding + "," + padding / 2 + ")")
            .attr("d", d3.geoPath())
            .attr("fill", function(d) { return color(d.value); });
    }

    } 
  }
});

function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({ x: a[i], i: i, y: b[j], j: j });
    return c;
}

