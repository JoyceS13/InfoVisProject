// d3init.js - Initialization file for D3.js setup and CSV loading

// init d3, load the data file
function initialize() {
    // Load CSV file
    return d3.csv('data/Spotify_Youtube.csv')
        .then(function (data) {
            // Log data 
            //console.log('CSV data:', data);

            return data;
        })
        .catch(function (error) {
            // Handle errors if the file fails to load
            console.error('Error loading the CSV file:', error);
        });
}