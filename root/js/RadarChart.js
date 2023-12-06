

class RadarChart {
    domain = [0,100];
    yTicks = [100];
    constructor (parent, width = 500, height = 500, margin = { top: 50, right: 50, bottom: 50, left: 50 }) {
        this.parent = parent;
        this.width = width;
        this.height = height;
        this.margin = margin;
    }

    setDomain (start, end) {
        this.domain = [start, end];
    }

    setYticks(yTicks) {
        this.yTicks = yTicks;
    }

    draw (features, data) {
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;
        const radius = Math.min(chartWidth, chartHeight) / 2;
      
        const svg = d3.select(this.parent)
          .append("svg")
          .attr("width", this.width)
          .attr("height", this.height)
          .append("g")
          .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")"); // Center the chart
      
        const scale = d3.scaleLinear()
          .domain(this.domain) 
          .range([0, radius]);
      
        const points = features.map((feature, i) => {
          return {
            x: scale(data[feature]) * Math.cos((Math.PI / 2) + (2 * Math.PI * i / features.length)),
            y: scale(data[feature]) * Math.sin((Math.PI / 2) + (2 * Math.PI * i / features.length))
          };
        });
      
        const lineGenerator = d3.line()
          .x(d => d.x)
          .y(d => d.y)
          .curve(d3.curveCardinalClosed.tension(.75)); // Change the curve type here
      
        const path = svg.append("path")
          .datum(points)
          .attr("fill", "rgba(0, 0, 255, 0.5)")
          .attr("stroke", "blue")
          .attr("stroke-width", 2)
          .attr("d", lineGenerator);
        
          const circles = svg.selectAll(".circle")
            .data(this.yTicks)
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", d => scale(d))
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
          .attr("x2", (d, i) => scale.range()[1] * Math.cos((Math.PI / 2) + (2 * Math.PI * i / features.length)))
          .attr("y2", (d, i) => scale.range()[1] * Math.sin((Math.PI / 2) + (2 * Math.PI * i / features.length)))
          .attr("stroke", "black");
      
        axis.append("text")
          .attr("x", (d, i) => scale.range()[1] * Math.cos((Math.PI / 2) + (2 * Math.PI * i / features.length)))
          .attr("y", (d, i) => scale.range()[1] * Math.sin((Math.PI / 2) + (2 * Math.PI * i / features.length)))
          .text(d => d)
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em");
      }
}

function drawRC() {
    let features = ["Danceability", "Energy", "Speechiness", "Acousticness", "Instrumentalness", "Liveness"];

rc = new RadarChart("#radarChart");
rc.setDomain(0,1);
rc.setYticks([.5,1]);
rc.draw(features,data);
}
