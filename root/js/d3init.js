// d3init.js - Initialization file for D3.js setup and CSV loading

// init d3, load the data file
function initialize() {
    // Load CSV file
    d3.csv('data/dataset.csv')
        .then(function (data) {
            // Log data 
            window.dataset = data
            initGenreGraph(data);
            init_barChart(data);
            return data;
        })
        .catch(function (error) {
    
            // Handle errors if the file fails to load
            console.error('Error loading the CSV file:', error);
        });
}

document.addEventListener('DOMContentLoaded', initialize);