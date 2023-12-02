class RadarChart{
    constructor(container){
        this.container = container;

        let width = 600;
        let height = 600;

        let features = ["Danceability", "Energy", "Speechiness", "Acousticness", "Instrumentalness", "Liveness"];

        const svg = d3.select(container).append("svg")
            .attr("width", width)
            .attr("height", height);
        
        //feature values to pixels
        let radialScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, 250]);
        let ticks = [0, 0.5, 1];

        //draw circular lines of plot
        svg.selectAll("circle")
            .data(ticks)
            .join(
                enter => enter.append("circle")
                    .attr("cx", width / 2)
                    .attr("cy", height / 2)
                    .attr("fill", "none")
                    .attr("stroke", "gray")
                    .attr("r", d => radialScale(d))
            );

        //add ticks for circular lines
        svg.selectAll(".ticklabel")
            .data(ticks)
            .join(
                enter => enter.append("text")
                    .attr("class", "ticklabel")
                    .attr("x", width / 2 +5)
                    .attr("y", d => height / 2 - radialScale(d))
                    .text(d => d.toString())
            );


        function angleToCoordinate(angle, value){
                let x = Math.cos(angle) * radialScale(value);
                let y = Math.sin(angle) * radialScale(value);
                return {"x": width / 2 + x, "y": height / 2 - y};
        }

        //determine at what coordinates lines for each feature axis should be drawn
        let featureData = features.map((f, i) => {
            let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
                return {
                    "name": f,
                    "angle": angle,
                    "line_coord": angleToCoordinate(angle, 1),
                    "label_coord": angleToCoordinate(angle, 1.1)
                };
        });
        
        // draw feature axes
        svg.selectAll("line")
            .data(featureData)
            .join(
                enter => enter.append("line")
                    .attr("x1", width / 2)
                    .attr("y1", height / 2)
                    .attr("x2", d => d.line_coord.x)
                    .attr("y2", d => d.line_coord.y)
                    .attr("stroke","black")
            );

        // draw feature axis label
        svg.selectAll(".axislabel")
            .data(featureData)
            .join(
                enter => enter.append("text")
                    .attr("x", d => d.label_coord.x)
                    .attr("y", d => d.label_coord.y)
                    .text(d => d.name)
            );
    }

    
}