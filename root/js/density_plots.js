var width = window.innerWidth,

padding = 60; 





var traitsX = ['Danceability', 'Energy', 'Loudness', 'Valence', 'Tempo'];
var traitsY = ['Views', 'Stream', 'Interactions'];
var size = (width - 2 * padding ) / traitsX.length;
var svg = d3.select("#density_plots").append("svg")
        .attr("id", "density-svg")
        .attr("width", size * traitsX.length + 3 * padding)
        .attr("height", size * traitsY.length + 3 * padding)
        .append("g")
        .attr("transform", "translate(" + padding + "," + (-padding / 2) + ")");


var cell = svg.selectAll(".cell")
    .data(cross(traitsY, traitsX)) // Reversed order of traitsY and traitsX for the correct layout
    .enter().append("g")
    .attr("transform", function(d, i) {
       var translateX = (i % traitsX.length)  * (size + 10) + 1.5 * padding;
       var translateY = (traitsY.length - Math.floor(i / traitsX.length) - 1) * (size + 50);

        return "translate(" + translateX + "," + translateY + ")";
})
var color = d3.scaleLinear()
              .domain([0.01, 1]) 
              .range(["#C2A0D9", "#F2D750"]); 
          

// Function to create density plots
function createDensityPlots(data) {
    document.addEventListener('DOMContentLoaded', initialize);

    // Data processing
    domainByTrait = {}
    data.forEach(function(d) {
        // d['Duration_mins'] = +d['Duration_ms'] / 60000; // Convert ms to mins and add a new property
        d['Interactions'] = +d['Comments'] + +d['Likes'];
    });

   
    traitsX.forEach(function(traitX) {
        domainByTrait[traitX] = d3.extent(data, function(d) { return +d[traitX]; });
    });

    traitsY.forEach(function(traitY) {
        domainByTrait[traitY] = d3.extent(data, function(d) { return +d[traitY]; });
    });

    cell.selectAll("path").remove();
    cell.selectAll(".label").remove();
    
    
    cell.selectAll(".x.axis").remove();
    cell.selectAll(".y.axis").remove();
    cell.each(plot);

    
    
    
    
    function plot(p) {
        
        var x = d3.scaleLinear()  
            .range([padding, size - padding]);

        var y = d3.scaleLinear()
            .range([size - padding  , padding]);
        var cell = d3.select(this);

        //xAxis
        var xAxis = x.domain(domainByTrait[p.x]).range([padding, size - padding]).nice();
        
        //yAxis
        var yAxis = y.domain(domainByTrait[p.y]).range([size - padding, padding]).nice();
       
        // Append x-axis label
        cell.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", size / 2)
            .attr("y", size + padding / 2)
            .style("font-weight", "bold") // Make the x-axis label text bold
            .text(p.x);

        // Append y-axis label
        cell.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -size / 2)
            .attr("y", - padding / 2 )
            .style("font-weight", "bold") // Make the y-axis label text bold
            .text(p.y);
   
        var xAx = cell.append("g")
            .attr("class", "x axis") // Add class for x-axis
            .attr("transform", `translate(0, ${size - padding / 5})`)
            .call(d3.axisBottom(x).ticks(4).tickFormat(formatAxisTick));
        
        var yAx = cell.append("g")
            .attr("class", "y axis") // Add class for x-axis
            .attr("transform", `translate(${padding / 5}, 0)`)
            .call(d3.axisLeft(y).ticks(5));

        

        const densityData = d3.contourDensity()
            .x(function(d) { return x(d[p.x]); })
            .y(function(d) { return y(d[p.y]); })
            .size([size -  padding, size -  padding]) // Adjusted size for correct placement
            .bandwidth(4)
            (data);
        
        
        
        cell.insert("g", "g")
            .selectAll("path")
            .data(densityData)
            .enter().append("path")
            .attr("transform", "translate(" + padding + "," + padding / 10 + ")") // Adjusted translate
            .attr("d", d3.geoPath())
            .attr("fill", function(d) { return color(d.value); });
        
        
        
        
        var brush = d3.brush()
            .extent([[0,0 ], [size , size]])
            .on("end", brushed);
        
        

        cell.append("g")
            .attr("class", "brush")
            .call(brush);
        
        
        function brushed(event) {
                const extent = event.selection;
              
                if (extent) {
                    const [[x0, y0], [x1, y1]] = extent;
              
                    const xDomainNew = [x.invert(x0), x.invert(x1)];
                    const yDomainNew = [y.invert(y1), y.invert(y0)];


                    x.domain(xDomainNew);
                    y.domain(yDomainNew);
                    //cell.select(".brush").call(brush.move, null) 
                  
                } else {
                    x.domain(domainByTrait[p.x]);
                    y.domain(domainByTrait[p.y]);
                
                }
                const updatedDensityData = calculateDensityData();
                updatePlot(updatedDensityData);
              
                function calculateDensityData() {
                  return d3.contourDensity()
                    .x(d => x(d[p.x]))
                    .y(d => y(d[p.y]))
                    .size([size - padding, size - padding]) 
                    .bandwidth(4)(data);
                }
              
                function updatePlot(updatedData) {
                  cell.selectAll("path").remove();
              
                  xAx.transition().duration(1000).call(d3.axisBottom(x).ticks(4).tickFormat(formatAxisTick));
                  yAx.transition().duration(1000).call(d3.axisLeft(y).ticks(4));
              
                  cell.selectAll("path")
                    .data(updatedData)
                    .enter().append("path")
                    .attr("transform", "translate(" + padding + "," + padding / 10 + ")")
                    .attr("d", d3.geoPath())
                    .attr("fill", d => color(d.value));
                }
              
        }
              
    
  }



};

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
// Integrated function to handle radio button changes and initialize density plots
function handleRadioChangeAndInitDensity(inputData, genresArray) {
    console.log(genresArray)
    // Function to handle radio button changes
    function handleRadioChange(genres) {
        var selectedValue = document.querySelector('input[name="displayOption"]:checked').value;
        console.log("Selected value:", selectedValue);
    
        var genresLabel = document.querySelector('label[for="genresPerSongRadio"]');
        if (!genres) {
            genresLabel.textContent = 'Select A Song Or An Artist';
            genresLabel.style.pointerEvents = 'none';
            createDensityPlots(inputData); // Update plots with all data
            return;
        }
    
        genresLabel.textContent = genres.length > 0 ? 'Genres Per Song Or Artist (Selected)' : 'Genres Per Song';
        genresLabel.style.pointerEvents = genres.length > 0 ? 'auto' : 'none';
    
        if (selectedValue === "genresPerSong" && genres.length > 0) {
            var filteredData = inputData.filter(d => genres.includes(d.track_genre));
            createDensityPlots(filteredData); // Update plots with filtered data
        } else {
            createDensityPlots(inputData); // Update plots with all data
        }
    }
    

    // Add event listeners to the radio buttons for change event
    document.querySelectorAll('input[name="displayOption"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            handleRadioChange(genresArray);
        });
    });

    // Call the initial density plot creation based on provided data
    handleRadioChange(genresArray);

    
}


