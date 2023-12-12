class RadarChart {
    domain = [0, 100];
    yTicks = [100];
    constructor(parent, width = 500, height = 500, margin = { top: 50, right: 50, bottom: 50, left: 50 }) {
        this.parent = parent;
        this.width = width;
        this.height = height;
        this.margin = margin;
    }

    setDomain(start, end) {
        this.domain = [start, end];
    }

    setYticks(yTicks) {
        this.yTicks = yTicks;
    }

    drawGraph(features) {
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;
        const radius = Math.min(chartWidth, chartHeight) / 2;

        const svg = d3.select(this.parent)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")"); // Center the chart

        this.scale = d3.scaleLinear()
            .domain(this.domain)
            .range([0, radius]);

        const circles = svg.selectAll(".circle")
            .data(this.yTicks)
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", d => this.scale(d))
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("stroke-dasharray", "3"); // Make circles dashed or customize stroke as needed


        const axis = svg.selectAll(".axis")
            .data(features)
            .enter()
            .append("g")
            .attr("class", "axis");

        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => this.scale.range()[1] * Math.cos((Math.PI / 2) + (2 * Math.PI * i / features.length)))
            .attr("y2", (d, i) => this.scale.range()[1] * Math.sin((Math.PI / 2) + (2 * Math.PI * i / features.length)))
            .attr("stroke", "black");

        axis.append("text")
            .attr("x", (d, i) => this.scale.range()[1] * Math.cos((Math.PI / 2) + (2 * Math.PI * i / features.length)))
            .attr("y", (d, i) => this.scale.range()[1] * Math.sin((Math.PI / 2) + (2 * Math.PI * i / features.length)))
            .text(d => d)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em");
        this.svg = svg;
    }

    drawData(data, color) {
        const points = features.map((feature, i) => {
            return {
                x: this.scale(data[feature]) * Math.cos((Math.PI / 2) + (2 * Math.PI * i / features.length)),
                y: this.scale(data[feature]) * Math.sin((Math.PI / 2) + (2 * Math.PI * i / features.length))
            };
        });
    
        const lineGenerator = d3.line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveCardinalClosed.tension(.75)); // Change the curve type here
    
        const path = this.svg.append("path")
            .datum(points)
            .attr("fill", color.copy({opacity: 0.5})) // Use d3 color to set opacity
            .attr("stroke", color.toString())
            .attr("stroke-width", 2)
            .attr("d", lineGenerator);
    }

    draw(features, data) {
        this.drawGraph(features);
        this.drawData(data);
    }
    clear() {
        this.svg.selectAll("path").remove();
    }
}


