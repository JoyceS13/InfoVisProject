document.addEventListener("DOMContentLoaded", function () {
    const svg = d3.select("body")
        .append("svg")
        .attr("width", 400)
        .attr("height", 300);

    svg.append("circle")
        .attr("cx", 200)
        .attr("cy", 150)
        .attr("r", 50)
        .attr("fill", "blue");
});