let genreChart; // Chart.js radar chart instance
let genreWorkingSet; // Working set for genre data
// Define features
let features = ["Danceability", "Energy", "Valence", "Tempo", "Loudness"];

// Draw the data wieghted, using the given dataset, color and name
function drawWeighted(dataSet, color, name) {
  // Prepare data
  const avgColumns = {};

  // Loop over each row in the given dataset
  dataSet.forEach(row => {
    // Loop over all the keys in the row
    Object.keys(row).forEach(key => {
      // Check if the key is relevant
      if (features.includes(key)) {
        // Add they key and the value to avgColumns
        avgColumns[key] = (avgColumns[key] || 0) + (row[key] / 1);
      }
    });
  });

  // Loop over all the features, and normalise for the amount of songs in the dataset
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

// Setup the genre graph
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
          ticks: {
            stepSize: 0.2,
        },
        },
      },
    },
  });

  // Setup genre search

  // Isolate each genre name
  let genres = new Set(data.map(d => d.track_genre));

  // Loop over the genre names, add them as a search option
  genres.forEach(function (genre) {
    const option = document.createElement("option");
    option.setAttribute("value", genre);
    option.innerHTML = genre;
    document.getElementById('items').appendChild(option);
  });
}

// Draw the given genres in the polit
function drawGenres(genres) {
  // Setup the color scale, based on the amount of genres
  const colorScale = d3.scaleLinear()
  .domain([0, genres.length - 1])
  .range(['#D95D41', '#8ABF9C']);

  // Get the colors based on the scale
  const colors = genres.map((genre, i) => d3.color(colorScale(i)));

  // Clear existing datasets
  genreChart.data.datasets = [];

  // Draw radar charts for selected genres
  genres.forEach((genre, i) => {
    const genreSet = genreWorkingSet.filter(x => x.genre === genre);
    drawWeighted(genreSet, colors[i], genre);
  });
}

// Setup the searchbar
document.addEventListener('DOMContentLoaded', function () {
  // Setup select2 plugin
  $('#items').select2({
    placeholder: 'Select items',
    allowClear: true,
    width: 'resolve',
  });
  // draw genres on change event
  $('#items').on('change', function () {
    // Get the selected genres
    const selectedGenres = $(this).val();
    // draw.
    drawGenres(selectedGenres);
    // Highlight the options, selected from the artist/song search tool
    highlighted.forEach(genre => {
      $("li[title='"+genre+"']").css("background-color",'#F2D750');
  });
  });
});