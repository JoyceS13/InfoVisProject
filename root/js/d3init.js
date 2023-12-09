// d3init.js - Initialization file for D3.js setup and CSV loading

// init d3, load the data file
function initialize() {
    // Load CSV file
    d3.csv('data/dataset.csv')
        .then(function (data) {
            // Log data 
            console.log('CSV data:', data);
            console.log(data[1]);
            drawGraphs(data);
        })
        .catch(function (error) {
    
            // Handle errors if the file fails to load
            console.error('Error loading the CSV file:', error);
        });
}

// Call the initialization function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    initialize(); // Call the initialize function when the DOM is loaded
})