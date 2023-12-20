document.addEventListener('DOMContentLoaded', function() {
    // Usage of initialize function
    
    initializeOriginalData(function(data) {
       densityPlots(data);
    });
});
var width = window.innerWidth,
size = 250,
padding = 50; 
d3.csv("../data/Spotify_Youtube.csv").then(function(data) {
//function densityPlots(data){
    // Append "Show by genre" checkbox

    var checkboxDiv = d3.select("body")
    .append("div")
    .attr("id", "showByGenreCheckbox");

    checkboxDiv.append("input")
    .attr("type", "checkbox")
    .attr("id", "showByGenre");

    checkboxDiv.append("label")
    .attr("for", "showByGenre")
    .text("Show by genre");
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
        //domainByTrait[traitY][1] = domainByTrait[traitY][1];
       // domainByTrait[traitY][0] = 10000;
    });

    var svg = d3.select("body").append("svg")
        .attr("width", size * traitsX.length + 2 * padding) // Adjusted width based on the number of x traits
        .attr("height", size * traitsY.length + 2 * padding) // Adjusted height based on the number of y traits
        .append("g")
        .attr("transform", "translate(" + padding + "," - padding / 2 + ")");
    

       
    var cell = svg.selectAll(".cell")
        .data(cross(traitsY, traitsX)) // Reversed order of traitsY and traitsX for the correct layout
        .enter().append("g")
        .attr("transform", function(d, i) {
          //var translateX = (i % traitsX.length) * (size + padding); // Adjusted translation for X
         // var translateY = Math.floor(i / traitsX.length) * (size + padding); // Adjusted translation for Y
         var translateX = (i % traitsX.length)  * (size + 10) + 1.5 * padding;
         //var translateY = (traitsY.length - Math.floor(i / traitsX.length) - 1) * size;
         var translateY = (traitsY.length - Math.floor(i / traitsX.length) - 1) * (size + 30);

         return "translate(" + translateX + "," + translateY + ")";
      }).each(plot);

    function plot(p) {
      
        var x = d3.scaleLinear()  
            .range([padding, size - padding]);

        var y = d3.scaleLinear()
            .range([size - padding  , padding]);
        var cell = d3.select(this);

        //xAxis
        var xAxis = x.domain(domainByTrait[p.x]).range([padding, size - padding]).nice();
        
        //yAxis
        var yAxis = y.domain(domainByTrait[p.y]).range([size - padding / 2 - 10, padding / 2]).nice();
       
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
            .attr("y", - padding )
            .text(p.y);
        // Append a group element for brush paths
        var brushPaths = cell.append("g").attr("class", "brush-paths");

        var xAx = cell.append("g")
            .attr("transform", `translate(0, ${size - padding / 5})`)
            .call(d3.axisBottom(x).ticks(4).tickFormat(formatAxisTick).tickSizeOuter(0));
        var yAx = cell.append("g")
            //.attr("transform", `translate(${padding / 5}, 0)`)
            .call(d3.axisLeft(y).ticks(5));

        var color = d3.scaleLinear()
              .domain([0.01, 4]) // Assuming the range of your density values
              .range(["#8ABF9C", "#F2D750"]); // Define your desired color range
          
        const densityData = d3.contourDensity()
            .x(function(d) { return x(d[p.x]); })
            .y(function(d) { return y(d[p.y]); })
            .size([size, size]) // Adjusted size for correct placement
            .bandwidth(5)
            (data);

        cell.insert("g", "g")
            .selectAll("path")
            .data(densityData)
            .enter().append("path")
            .attr("transform", "translate(" + padding + "," + -padding / 10 + ")") // Adjusted translate
            .attr("d", d3.geoPath())
            .attr("fill", function(d) { return color(d.value); });
    
        
        var brush = d3.brush()
            .extent([[padding, padding], [size - padding, size - padding]])
            .on("end", brushed);
        
        

        cell.append("g")
            .attr("class", "brush")
            .call(brush);
      
        function brushed(event) {
          var extent = event.selection;
          if (extent) {
              var [[x0, y0], [x1, y1]] = extent;
  
              // Update x and y domains based on brush extent
              var xDomainNew = [x.invert(x0), x.invert(x1)];
              var yDomainNew = [y.invert(y1), y.invert(y0)];
  
              // Update the scales with new domains
              x.domain(xDomainNew).nice();
              y.domain(yDomainNew).nice();
  
              

              // Clear the brush selection
              //d3.select(this).call(brush.move, null);

              // Recalculate densityData based on updated domains
              const updatedDensityData = d3.contourDensity()
                  .x(function(d) { return x(d[p.x]); })
                  .y(function(d) { return y(d[p.y]); })
                  .size([size, size])
                  .bandwidth(4)
                  (data);
  
              // Remove existing paths
              cell.selectAll("path").remove();
              
              // Transition axes to reflect the new domain
              xAx.transition().duration(1000).call(d3.axisBottom(x).ticks(4).tickFormat(formatAxisTick).tickSizeOuter(0));
              yAx.transition().duration(1000).call(d3.axisLeft(y).ticks(4));

              

              // Enter new paths for updated density data
              cell.selectAll("path")
                  .data(updatedDensityData)
                  .enter().append("path")
                  .attr("transform", "translate(" + padding + "," + -padding / 10 + ")") // Adjusted translate
                  .attr("d", d3.geoPath())
                  .attr("fill", function(d) { return color(d.value); });

           
                

          }
        
       else {
        // When there's no selection, zoom back out to original scale

        // Reset the scales to their original domains
        x.domain(domainByTrait[p.x]).nice();
        y.domain(domainByTrait[p.y]).nice();


        // Recalculate densityData based on original domains
        const updatedDensityData = d3.contourDensity()
            .x(function(d) { return x(d[p.x]); })
            .y(function(d) { return y(d[p.y]); })
            .size([size, size])
            .bandwidth(5)
            (data);

        // Remove existing paths
        cell.selectAll("path").remove();

        // Transition axes to reflect the new domain
        xAx.transition().duration(1000).call(d3.axisBottom(x).ticks(4).tickFormat(formatAxisTick).tickSizeOuter(0));
        yAx.transition().duration(1000).call(d3.axisLeft(y).ticks(4));

    
        // Enter new paths for updated density data
        cell.selectAll("path")
            .data(updatedDensityData)
            .enter().append("path")
            .attr("transform", "translate(" + padding + "," + -padding / 10 + ")") // Adjusted translate
            .attr("d", d3.geoPath())
            .attr("fill", function(d) { return color(d.value); });
        }

    } 
  }
//}
});

function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({ x: a[i], i: i, y: b[j], j: j });
    return c;
}

function formatAxisTick(d) {
  if (d === 0) {
    return "0M";
}
  return d3.format('.2s')(d).replace('G', 'B').replace(/(\.0+)?G$/, 'M');
}