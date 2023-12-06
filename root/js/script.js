function drawRC(data) {
  let features = ["Danceability", "Energy", "Speechiness", "Acousticness", "Instrumentalness", "Liveness"];

  rc = new RadarChart("#radarChart");
  rc.setDomain(0, 1);
  rc.setYticks([.5, 1]);
  rc.draw(features, data);
}