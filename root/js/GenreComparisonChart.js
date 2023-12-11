let features = ["Danceability", "Energy", "Valence", "Loudness", "Tempo"];

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


function drawGraphs(data) {

  const maxTempo = d3.max(data, d => d.Tempo/1);
  const workingSet = data.map(function (row) {
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

  genres = new Set(data.map(d => d.track_genre));

  genres.forEach(function(genre) {
    genreSet = workingSet.filter(x => {return x.genre == genre});
    const container = document.createElement("div");
    container.setAttribute("id", genre);
    document.getElementById("genre_chart").appendChild(container);
    rc = new RadarChart(`#${genre}`);
    rc.setDomain(0, 1);
    rc.setYticks([.5, 1]);
    console.log(rc);
    rc.drawGraph(features);
    draw_weighted(genreSet, rc);
  });


}
