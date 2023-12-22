// displays a bar chart with the top 20 songs or artists

export const Top10BarChartComponent = {
    template: `
      <div class="max-h-52">
        <div class="text-xl font-semibold">Top 20 {{ isSong ? "Songs":"Artists" }}</div>
        <div class="tooltip absolute text-xs bg-white bg-opacity-60 rounded-md z-50 p-1"></div>
        <div class="top10_bar_chart max-h-48 overflow-auto bg-white"></div>
      </div>`,
    data() {
        return {
            barChart: null
        }
    },
    props: {
        data: Object,
        isSong: Boolean,
        componentId: String
    },
    methods: {
        createBarChart() {

            //define svg dimensions
            const svg_width = 500;
            const svg_height = 700;

            const component = `#${this.componentId}`

            //create svg for x-axis, which is not part of the main svg
            //this enables the x-axis to be fixed while the bars are scrollable
            const axisheight = 40;
            const xAxisSvg = d3.select(component).select(".top10_bar_chart").append("svg")
                .attr("width", svg_width)
                .attr("height", axisheight)
                .style("background-color", "inherit")
                .style("opacity", "1")
                .style("position", "absolute")
                .style("z-index", "40");

            //create main svg for bars and y-axis
            const svg = d3.select(component).select(".top10_bar_chart")
                .append("svg")
                .attr("width", svg_width)
                .attr("height", svg_height)
                .attr("transform", "translate(0," + axisheight + ")");

            const margin = {top: 0, right: 10, bottom: 0, left: 120};

            //define width and height of the chart area for the bars
            const width = svg_width - margin.left - margin.right;
            const height = svg_height - margin.top - margin.bottom - axisheight

            const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

            //get the top 20 songs or artists
            const barData = this.data.slice(0, 20)

            //define scales
            //y is a band scale with different songs/artists
            const y = d3.scaleBand()
                .domain(barData.map(d => this.isSong ? d.Track : d.Artist))
                .rangeRound([0, height]).padding(0.1)
            //x is a linear scale with popularity numbers
            const x = d3.scaleLinear()
                .domain([0, d3.max(barData, d => d.popularity)])
                .range([0, width]);

            // add y-axis to the main svg
            g.append("g")
                .attr("class", "axis axis--y z-40")
                .call(d3.axisLeft(y))
                .style("object-position", "left")
                .selectAll(".tick text")  // Select all y-axis tick labels
                // Call the wrap function for word wrapping to prevent the labels from being cut off
                .call(this.wrap, margin.left-8);

            //use billion instead of giga
            const formatAxis = d3.format(".1~s");

            // Append x-scale to the x-axis svg
            xAxisSvg.append("g")
                .attr("transform", "translate(" + margin.left + ", " + axisheight + ")")
                .call(d3.axisTop(x).ticks(10, "s").tickFormat(d => formatAxis(d / 1e9) + "B"))
                .append("text")
                .attr("x", 6)
                .attr("fill", "#000")
                .text("Popularity")
                .attr("class", "font-medium text-xs")
                .attr("transform", "translate(0,-25)");;

            // Append bars to the main svg
            g.selectAll(".bar")
                .data(barData)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("y", d => y(this.isSong ? d.Track : d.Artist))
                .attr("x", x(0))
                .attr("fill", "rgba(138, 191, 156, 0.8)")
                .attr("height", y.bandwidth())
                .attr("width", d => x(d.popularity))
                //when hovering over a bar, change the color and show the tooltip
                .on("mouseover", function (event, d) {
                    // Change color and show tooltip on hover
                    d3.select(this).attr("fill", "rgba(138, 191, 156, 0.4)");

                    // Display tooltip
                    d3.select(component).select(".tooltip")
                        .html(`${d.Track || d.Artist}<br>Click to take a closer look`)
                        .style("visibility", "visible");
                })
                //when the mouse leaves the bar, reset the color and hide the tooltip
                .on("mouseout", function () {
                    // Reset color and hide tooltip on mouseout
                    d3.select(this).attr("fill", "rgba(138, 191, 156, 0.8)");

                    // Hide tooltip
                    d3.select(component).select(".tooltip").style("visibility", "hidden");
                })
                //when clicking on a bar, emit the id or artist to the parent component
                // to select the song/artist on the dashboard
                .on("click", (event, d) => {
                    // Emit the id or artist when a bar is clicked
                    optionChanged(this.isSong, this.isSong ? d.track_id : d.Artist);
                    this.$emit("barClick", this.isSong ? d.track_id : d.Artist);
                });

            // make the tooltip follow the mouse
            svg.on("mousemove", function (event) {
                // Update tooltip position near the mouse pointer
                d3.select(component).select(".tooltip").style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            });

            //save the svg to the component
            this.barChart = svg;
        },
        // Add y-axis labels with wrapping
        wrap(text, width) {
            text.each(function () {

                //select a label
                const label = d3.select(this);
                const words = label.text().split(/\s+/).reverse();
                let word;
                let line = [];

                //define dimensions for the span elements in the label
                const lineHeight = 1.1; // ems
                const y = label.attr("y");
                const dy = parseFloat(label.attr("dy"));

                //to make the text not overlap the ticks
                const rightMargin = 8;

                //add tspan elements to the label
                let tspan = label.text(null)
                    .append("tspan")
                    .attr("width", width)
                    .attr("x", -rightMargin)
                    .attr("y", y)
                    .attr("dy", dy + "em")
                    .style("object-position", "left")

                //wrap the text
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    //if the text is too long, add a new tspan element to form a new line
                    if (tspan.node().getComputedTextLength() > width && line.length > 1) {
                        line.pop();
                        tspan.text(line.join(" "));
                        // move the first tspan element up
                        tspan.attr("dy", -0.5 * lineHeight + "em")
                        line = [word];
                        //add a new tspan element with the rest of the words
                        tspan = label.append("tspan").attr("x", -rightMargin).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
                    }
                }
            });
        }
    },
    mounted() {
        this.createBarChart()
    }
}