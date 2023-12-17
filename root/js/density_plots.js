var width = 1000,
    size = 300,
    padding = 40;

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
        x.domain(domainByTrait[p.x]).range([padding, size - padding]).nice();
        y.domain(domainByTrait[p.y]).range([padding, size - padding]);

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

        cell.append("g")
            .attr("transform", `translate(0, ${size - padding / 3})`)
            .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format(".1")));
        cell.append("g")
            .attr("transform", `translate(${padding / 2}, 0)`)
            .call(d3.axisLeft(y).ticks(5));

            var color = d3.scaleSequentialLog(d3.interpolateViridis)
            .domain([.1, 15]);

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
    }
});

function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({ x: a[i], i: i, y: b[j], j: j });
    return c;
}

// Define an array of music genres
var musicGenres = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'R&B', 'Jazz', 'Country'];

// Append a select element for the dropdown menu
var dropdown = d3.select("#genreDropdown").on("change", function() {
    // Get the selected genre
    var selectedGenre = d3.select(this).property("value");
    // Perform actions based on the selected genre (you can update the plots accordingly)
    console.log("Selected Genre:", selectedGenre);
    // Implement logic to update the plots based on the selected genre
});

// Add options to the dropdown menu
dropdown.selectAll("option")
    .data(musicGenres)
    .enter().append("option")
    .attr("value", function(d) { return d; })
    .text(function(d) { return d; });
