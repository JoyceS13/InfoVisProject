let features = ["Danceability", "Energy", "Valence", "Loudness", "Tempo"];
let genre_chart = new RadarChart("#genre_chart");
let genre_working_set = undefined;

function draw_weighted(dataSet,chart) {
  // Prepare data
  const  totalViews = d3.sum(dataSet, d => d.Views);
  const avgColumns = {};
  dataSet.forEach(row => {
    Object.keys(row).forEach(key => {
      if (features.includes(key)) {
        avgColumns[key] = (avgColumns[key] || 0) + (row[key]/1);
      }
    });
  });
  for(let feature of features) {
    avgColumns[feature] = avgColumns[feature]/dataSet.length;
  }
  chart.drawData(avgColumns, 255,0,0);

}


function init_genre_graph(data) {
  // Setup working set for genredata.
  const maxTempo = d3.max(data, d => d.Tempo/1);
  genre_working_set = data.map(function (row) {
    return {
      Views: row.Views,
      Stream: row.Stream,
      Danceability: row.Danceability,
      Energy: row.Energy,
      Valence: row.Valence,
      Loudness: (row.Loudness)/60 + 1,
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
  genres.forEach(function(genre) {
    genreSet = genre_working_set.filter(x => {return x.genre == genre});
    draw_weighted(genreSet, genre_chart);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  $('#items').select2({
      placeholder: 'Select items',
      allowClear: true,
      width: 'resolve', // 'resolve' makes the width adjust to the container
  });
  $('#items').on('change', function() {
    const selectedValues = $(this).val();
    draw_genres(genres);
    console.log('Items selected:', selectedValues);
  })
});