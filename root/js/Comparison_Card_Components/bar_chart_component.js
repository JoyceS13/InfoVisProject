export const Top10BarChartComponent = {
    template: `
      <div>
        <div>Top 10 Bar Chart</div>
        <div class="tooltip absolute text-xs bg-white bg-opacity-60 rounded-md"></div>
        <div class="top10_bar_chart"></div>
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

            const svg_width = 400;
            const svg_height = 200;
            const component = `#${this.componentId}`

            const svg = d3.select(component).select(".top10_bar_chart")
                .append("svg")
                .attr("width", svg_width)
                .attr("height", svg_height)

            const margin = {top: 35, right: 20, bottom: 30, left: 100};
            const width = svg_width - margin.left - margin.right;
            const height = svg_height - margin.top - margin.bottom;

            const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            const barData = this.data.slice(0, 5)

            const y = d3.scaleBand()
                .domain(barData.map(d => this.isSong ? d.Track : d.Artist))
                .rangeRound([0, height]).padding(0.1)
            const x = d3.scaleLinear()
                .domain([0, d3.max(barData, d => d.popularity)])
                .range([0, width]);

            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y))
                .style("object-position", "left")
                .selectAll(".tick text")  // Select all y-axis tick labels
                .style("object-position", "left")
                .call(this.wrap, margin.left);  // Call the wrap function for word wrapping

            //use billion instead of giga
            const formatAxis = d3.format(".1~s");

            g.append("g")
                .attr("class", "axis axis--x")
                .call(d3.axisTop(x).ticks(10, "s").tickFormat(d => formatAxis(d / 1e9) + "B"))
                .append("text")
                .attr("x", 6)
                .attr("fill", "#000")
                .text("Popularity")
                .attr("transform", "translate(0,-25)");

            g.selectAll(".bar")
                .data(barData)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("y", d => y(this.isSong ? d.Track : d.Artist))
                .attr("x", x(0))
                .attr("height", y.bandwidth())
                .attr("width", d => x(d.popularity))
                .on("mouseover", function (event, d) {
                    // Change color and show tooltip on hover
                    d3.select(this).attr("fill", "#a2c8b3");

                    // Display tooltip
                    d3.select(component).select(".tooltip").html(`${d.Track || d.Artist}<br>Click to take a closer look`)
                        .style("visibility", "visible");

                })
                .on("mouseout", function () {
                    // Reset color and hide tooltip on mouseout
                    d3.select(this).attr("fill", "#000");

                    // Hide tooltip
                    d3.select(component).select(".tooltip").style("visibility", "hidden");
                })
                .on("click", (event, d) => {
                    // Emit the id or artist when a bar is clicked
                    this.$emit("barClick", this.isSong ? d.track_id : d.Artist);
                });

            svg.on("mousemove", function (event) {
                // Update tooltip position near the mouse pointer
                d3.select(component).select(".tooltip").style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            });


            this.barChart = svg;
        },
        // Add y-axis labels with wrapping
        wrap(text, width) {
            text.each(function () {
                const label = d3.select(this);
                const words = label.text().split(/\s+/).reverse();
                let word;
                let line = [];
                const lineHeight = 1.1; // ems
                const y = label.attr("y");
                const dy = parseFloat(label.attr("dy"));
                ///to make the text not overlap the ticks
                const rightMargin = 10;
                let tspan = label.text(null)
                    .append("tspan")
                    .attr("width", width)
                    .attr("x", -rightMargin)
                    .attr("y", y)
                    .attr("dy", dy + "em")
                    .style("object-position", "left")

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width && line.length > 1) {
                        line.pop();
                        tspan.text(line.join(" "));
                        tspan.attr("dy", -0.5 * lineHeight + "em")
                        line = [word];
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