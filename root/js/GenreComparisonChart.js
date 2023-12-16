let genreChart; // Chart.js radar chart instance
let genreWorkingSet; // Working set for genre data
let features = ["Danceability", "Energy", "Valence", "Loudness", "Tempo"];

function drawWeighted(dataSet, color, name) {
  // Prepare data
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

  // Draw a filled shape for the data
  genreChart.data.datasets.push({
    label: name,
    data: features.map(feature => avgColumns[feature]),
    backgroundColor: color.copy({opacity: 0.2}),
    borderColor: color,
    borderWidth: 2,
    fill: true,
  });

  // Update the chart
  genreChart.update();
}

function initGenreGraph(data) {
  // Setup working set for genre data.
  const maxTempo = d3.max(data, d => d.Tempo / 1);
  genreWorkingSet = data.map(row => ({
    Views: row.Views,
    Stream: row.Stream,
    Danceability: row.Danceability,
    Energy: row.Energy,
    Valence: row.Valence,
    Loudness: (row.Loudness) / 60 + 1,
    Tempo: row.Tempo / maxTempo,
    genre: row.track_genre
  }));

  // Setup genre chart.
  genreChart = new Chart(document.getElementById('genre_chart'), {
    type: 'radar',
    data: {
      labels: features,
      datasets: [],
    },
    options: {
      scales: {
        r: {
          min: 0,
          max: 1,
          stepSize: 0.25,
        },
      },
    },
  });

  // Setup selector
  let genres = new Set(data.map(d => d.track_genre));

  genres.forEach(function (genre) {
    const option = document.createElement("option");
    option.setAttribute("value", genre);
    option.innerHTML = genre;
    document.getElementById('items').appendChild(option);
  });
}

function drawGenres(genres) {
  const colors = genres.map((genre, i) => d3.rgb(d3.interpolateViridis(i / (genres.length - 1))));

  // Clear existing datasets
  genreChart.data.datasets = [];
  genreChart.update();

  // Draw radar charts for selected genres
  genres.forEach((genre, i) => {
    const genreSet = genreWorkingSet.filter(x => x.genre === genre);
    drawWeighted(genreSet, colors[i], genre);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // Setup select2 plugin
  $('#items').select2({
    placeholder: 'Select items',
    allowClear: true,
    width: 'resolve',
  });

  $('#items').on('change', function () {
    const selectedGenres = $(this).val();
    drawGenres(selectedGenres);
  });
});