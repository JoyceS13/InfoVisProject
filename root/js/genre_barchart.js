// Highlighted genres
let highlighted = [];

// Bar chart color definitions.
let bar_base_color = '#8ABF9C';
let bar_hover_color = '#679877';
let bar_highlight_color = '#F2D750';

// Initialization of the bar chart
function init_barChart(data) {
    // Generate a string set of all the genre names
    let genres = new Set(data.map(d => d.track_genre));

    // Define genre width and height
    let width = $('#genre_bars').width();
    let height = 650;

    // total averages for each genre
    const totals = [];
    // maximum amount of views, used for bar plot limits
    let maxTotalViews = 0;

    // Loop over all genre names
    genres.forEach(genre_name => {
        // Filter to get the songs for this genre
        const genreSet = genreWorkingSet.filter(x => x.genre === genre_name);
        // Calculate the average for this gnere
        const average = Math.round(genreSet.reduce((acc, row) => acc + row.Stream / 1, 0) / genreSet.length);
        // Add the average to the totals
        totals.push({ genre: genre_name, avg: average });
        // Update the maxTotalViews field to contain the new max
        maxTotalViews = Math.max(maxTotalViews, average);
    });

    // Sort the genres based on average streams.
    totals.sort((a, b) => b.avg - a.avg);

    // Define padding
    const padding = 50;
    const padding_left = 70;

    // Set up scale for x-axis (genres) with padding
    const xScale = d3.scaleBand()
        .domain(totals.map(row => row.genre))
        .range([padding_left, width - padding])
        .padding(0); // Remove padding between bars

    // Set up scale for y-axis (number of views)
    const yScale = d3.scaleLinear()
        .domain([0, maxTotalViews * 1.05])
        .range([height - padding, 0]);

    // Create an SVG container inside genre_bars
    const svg = d3.select('#genre_bars').append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create the tooltip
    const tooltipDiv = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '2px')
        .style('border-radius', '5px')
        .style('padding', '5px')
        .style('text-transform','capitalize');

    // Draw invisible bars for each genre
    svg.selectAll('.invisible-rect')
    .data(totals)
    .enter().append('rect')
    .attr('class', 'invisible-rect')
    .attr('x', d => xScale(d.genre))
    .attr('y', 0) // Set the y-coordinate to the top of the chart
    .attr('width', xScale.bandwidth())
    .attr('height', height - padding)
    .attr('fill', 'transparent') // Make the rectangles transparent
    .on('mouseover', function (event, d) {
        d3.select(this)
            .attr('fill', 'transparent'); // Ensure the invisible rectangle stays transparent
        d3.select(`rect[data-genre="${d.genre}"]`) // Select the corresponding visible bar
            .attr('fill', bar_hover_color); // Change color on hover
        tooltipDiv.transition().duration(200).style('opacity', .9);
        tooltipDiv.html(`${d.genre}<br>Average Streams: ${d.avg.toLocaleString()}`)
            .style('left', (event.pageX + 5) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function (event, d) {
        if(!highlighted.includes(d.genre)) {
            d3.select(`rect[data-genre="${d.genre}"]`) // Select the corresponding visible bar
            .attr('fill', bar_base_color); // Revert color on mouseout
        } else {
            d3.select(`rect[data-genre="${d.genre}"]`) // Select the corresponding visible bar
            .attr('fill', bar_highlight_color); // Revert color on mouseout
        }
        tooltipDiv.style('opacity', 0);
        tooltipDiv.style('left', '-500px'); // Move the tooltip off-screen when it disappears 

    })
    .on('mousemove', function (event, d) { 
        tooltipDiv.style('left', (event.pageX + 5) + 'px') // Follow the mouse.
            .style('top', (event.pageY - 28) + 'px');
    });

// Draw visible rectangles (bars) for each genre
svg.selectAll('.visible-rect')
    .data(totals)
    .enter().append('rect')
    .attr('class', 'visible-rect')
    .attr('data-genre', d => d.genre) // Add a data attribute for easy selection
    .attr('x', d => xScale(d.genre))
    .attr('y', d => yScale(d.avg))
    .attr('width', xScale.bandwidth())
    .attr('height', d => height - padding - yScale(d.avg / 1))
    .attr('fill', bar_base_color) // Adjust the color as needed
    .on('mouseover', function (event, d) {
        d3.select(this).attr('fill', bar_hover_color); // Change color on hover
        tooltipDiv.transition().duration(200).style('opacity', .9);
        tooltipDiv.html(`${d.genre}<br>Average Streams: ${d.avg.toLocaleString()}`)
            .style('left', (event.pageX + 5) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function (event, d) {

        if(!highlighted.includes(d.genre)) {
            d3.select(this).attr('fill', bar_base_color); // Revert color on mouseout
        }else {
            d3.select(this).attr('fill', bar_highlight_color); // Revert color on mouseout
        }
        tooltipDiv.style('opacity', 0);
        tooltipDiv.style('left', '-500px'); // Move the tooltip off-screen when it disappears

    })
    .on('mousemove', function (event, d) {
        tooltipDiv.style('left', (event.pageX + 5) + 'px') // Follow the mouse.
            .style('top', (event.pageY - 28) + 'px');
    });

    // Remove x labels
    svg.append('g')
        .attr('transform', `translate(0, ${height - padding})`)
        .call(d3.axisBottom(xScale).tickSize(0).tickFormat(''));

    // Add y-axis
    svg.append('g')
        .attr('transform', `translate(${padding_left}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat(d => d / 1e6 + 'M'));

    // Add x axis labels
    svg.append('text')
        .attr('transform', `translate(${width / 2}, ${height - padding + 20})`)
        .style('text-anchor', 'middle')
        .text('Genres');

    // Add y axis labels
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 10)
        .attr('x',  - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Average Number of Streams');
}

// Highlight the bars, function to be called from outside
function highlightBars(genres) {
    highlighted = genres;
    // Reset all bars to default color
    d3.selectAll('.visible-rect')
        .attr('fill', bar_base_color);
    genres.forEach(genre => {
    // Highlight the specified bars
    d3.select(`.visible-rect[data-genre="${genre}"]`)
    .attr('fill', bar_highlight_color);
    });
}