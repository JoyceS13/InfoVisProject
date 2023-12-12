let features = ["Danceability", "Energy", "Valence", "Loudness", "Tempo"];
let genre_chart = new RadarChart("#genre_chart");
let genre_working_set = undefined;

function draw_weighted(dataSet, chart, color) {
  // Prepare data
  const totalViews = d3.sum(dataSet, d => d.Views);
  const avgColumns = {};
  dataSet.forEach(row => {
    Object.keys(row).forEach(key => {
      if (features.includes(key)) {
        avgColumns[key] = (avgColumns[key] || 0) + (row[key] / 1);
      }
    });
  });
  for (let feature of features) {
    avgColumns[feature] = avgColumns[feature] / dataSet.length;
  }
  chart.drawData(avgColumns, color);

}


function init_genre_graph(data) {
  // Setup working set for genredata.
  const maxTempo = d3.max(data, d => d.Tempo / 1);
  genre_working_set = data.map(function (row) {
    return {
      Views: row.Views,
      Stream: row.Stream,
      Danceability: row.Danceability,
      Energy: row.Energy,
      Valence: row.Valence,
      Loudness: (row.Loudness) / 60 + 1,
      Tempo: row.Tempo / maxTempo,
      genre: row.track_genre
    }
  });

  // Setup genre chart.
  genre_chart.setDomain(0, 1);
  genre_chart.setYticks([.5, 1]);
  genre_chart.drawGraph(features);

  // setup selector
  let genres = new Set(data.map(d => d.track_genre));

  genres.forEach(function (genre) {
    const option = document.createElement("option");
    option.setAttribute("value", genre);
    option.innerHTML = genre;
    $('#items').append(option);
  })
}

function draw_genres(genres) {
  colors = [];
  for (let i = 0; i < genres.length; ++i) {
    colors.push(d3.rgb(d3.interpolateViridis(i / (genres.length - 1))));
  }
  genre_chart.clear();
  d3.select("#legend").html("");
  const legendDiv = d3.select("#legend");
  for(let i = 0; i < genres.length; i++){
    genreSet = genre_working_set.filter(x => { return x.genre == genres[i] });
    draw_weighted(genreSet, genre_chart, colors[i]);

    const legendItem = legendDiv.append("div")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-bottom", "8px"); // Adjust spacing as needed

    legendItem.append("div")
      .style("width", "18px")
      .style("height", "18px")
      .style("background-color", colors[i])
      .style("margin-right", "8px");

    legendItem.append("span")
      .text(genres[i])
      .style("font-size", "14px") // Adjust font size as needed
      .style("font-weight", "500"); // Adjust font weight as needed
  }
}

document.addEventListener('DOMContentLoaded', function () {
  $('#items').select2({
    placeholder: 'Select items',
    allowClear: true,
    width: 'resolve', // 'resolve' makes the width adjust to the container
  });
  $('#items').on('change', function () {
    const selected_genres = $(this).val();
    draw_genres(selected_genres);
    console.log('Items selected:', selected_genres);
  })
});