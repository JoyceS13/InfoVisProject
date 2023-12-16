let genreBarChart;

function formatTicks(value) {
    if (value >= 1e6) {
        return (value / 1e6).toFixed(1) + 'M';
    } else {
        return value;
    }
}

function init_barChart(data) {
    const genreTotalStreams = new Map();
    const genreSongCount = new Map();

    data.forEach(song => {
        const genre = song.track_genre;
        const streams = song.Stream / 1; 

        if (genreTotalStreams.has(genre)) {
            genreTotalStreams.set(genre, genreTotalStreams.get(genre) + streams);
            genreSongCount.set(genre, genreSongCount.get(genre) + 1);
        } else {
            genreTotalStreams.set(genre, streams);
            genreSongCount.set(genre, 1);
        }
    });

    const sortedGenres = Array.from(genreTotalStreams.keys()).sort((a, b) => {
        const normalizedA = genreTotalStreams.get(a) / genreSongCount.get(a);
        const normalizedB = genreTotalStreams.get(b) / genreSongCount.get(b);
        return normalizedB - normalizedA;
    });

    const sortedStreams = sortedGenres.map(genre => genreTotalStreams.get(genre) / genreSongCount.get(genre));

    const canvas = document.createElement('canvas');
    document.getElementById('genre_histogram').appendChild(canvas);

    const ctx = canvas.getContext('2d');

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedGenres,
            datasets: [{
                label: 'Average streams per Song',
                data: sortedStreams,
                backgroundColor: 'steelblue', // TODO: Change color
                barPercentage: 1.0,
                categoryPercentage: 1.0
            }]
        },
        options: {
            scales: {
                x: {
                    display: false, // Hide x-axis labels
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return formatTicks(value);
                        },
                    },
                },
            },
            plugins: {
                legend: {
                    display: false, // Hide the legend
                },
            },
            interaction: {
                mode: 'x', 
                intersect: false, // Do not require exact hover over the bar
            }
        }
    });
}

function highlight_genre_barchart(genre) {
    const index = barChart.data.labels.indexOf(genre);

    if (index !== -1) {
        barChart.data.datasets[0].backgroundColor = barChart.data.datasets[0].data.map((_, i) => (i === index ? 'orange' : 'steelblue'));//TODO: change color
        barChart.update();
    }
}
