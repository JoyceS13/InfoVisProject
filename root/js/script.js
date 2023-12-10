document.addEventListener('DOMContentLoaded', function () {
    // Call the initialize function when the DOM is loaded
    initialize().then(function (data) {
        //once the data is loaded generate the interactive elements

        //extract columns necessary to search for artists
        const artistSearchSet = new Set();
        data.forEach(row => artistSearchSet.add(row.Artist))
        const artistSearchData = Array.from(artistSearchSet).map(item => {
            return {
                artist: item,
                isArtist: true,
                isSong: false,
            }
        })

        //extract columns necessary to search for songs
        const songSearchData = data.map((row, index) => {
            return {
                isSong: true,
                isArtist: false,
                id: index,
                artist: row.Artist,
                track: row.Track

            }
        })

        //combine information for artists and songs
        const searchData = [
            ...artistSearchData,
            ...songSearchData
        ]

        console.log(searchData)

        const radarData = data.map((row, index) => {
            return {
                id: index,
                danceability: row.Danceability,
                energy: row.Energy,
                valence: row.Valence,
                tempo: row.Tempo/100,
                loudness: row.Loudness/-60
            }
        })

        console.log(radarData[1])

        var chartData = {
            labels: ['Danceability', 'Energy', 'Valence', 'Tempo', 'Loudness'],
            datasets: [{
                label: 'Sample Dataset',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                data: [radarData[1].danceability, radarData[1].energy, radarData[1].valence, radarData[1].tempo, radarData[1].loudness] // Adjust the values based on your data
            }]
        };

        //make radar chart
        // Configuration options for the radar chart
        var options = {
            scale: {
                angleLines: {
                    display: true
                },
                ticks: {
                    beginAtZero: true,
                    max: 1 // Adjust the maximum value based on your data
                }
            }
        };

        // Get the canvas element and create the radar chart
        var ctx = document.getElementById('radar_chart').getContext('2d');
        var radarChart = new Chart(ctx, {
            type: 'radar',
            data: chartData,
            options: options
        });

        //make infocards
        let infocard1 = new InfoCard("#info_card1", "song", data[1]);

        let infocard2 = new InfoCard("#info_card2");

        // Search bar dropdown elements
        const searchInput1 = d3.select('#searchInput1');
        const dropdownContent1 = d3.select('#dropdownContent1');
        const searchContainer1 = d3.select('#compare_search_select1');
        const searchInput2 = d3.select('#searchInput2');
        const dropdownContent2 = d3.select('#dropdownContent2');
        const searchContainer2 = d3.select('#compare_search_select2');

        //when a search input is chosen change the infocard
        function searchInput1Clicked(isSong, idOrArtist) {
            if (isSong){
                const song = data[idOrArtist]
                console.log(song)
                infocard1.setSongData(song)
            } else{
                infocard1.setArtistData(data.filter(row => row.Artist === idOrArtist))
            }
            //TODO change radar chart
        }

        function searchInput2Clicked(isSong, idOrArtist) {
            if (isSong){
                const song = data[idOrArtist]
                console.log(song)
                infocard2.setSongData(song)
            } else {
                infocard2.setArtistData(data.filter(row => row.Artist === idOrArtist))
            }
            //TODO change radar chart
        }

        // Add event listeners fo dropdown search bar
        searchInput1.on('keyup', function () { updateDropdown(searchInput1, dropdownContent1, searchData, searchInput1Clicked) });
        searchInput1.on('click', function () { updateDropdown(searchInput1, dropdownContent1, searchData, searchInput1Clicked) });
        searchInput2.on('keyup', function () { updateDropdown(searchInput2, dropdownContent2, searchData, searchInput2Clicked) });
        searchInput2.on('click', function () { updateDropdown(searchInput2, dropdownContent2, searchData, searchInput2Clicked)});

 

        // Close the dropdowns when clicking outside the search container
        d3.select("body").on('click', function (event) {
            if (!searchContainer1.node().contains(event.target)) {
                dropdownContent1.style('display', 'none');
            }
            if (!searchContainer2.node().contains(event.target)) {
                dropdownContent2.style('display', 'none');
            }
        });

    });

});

// Function to update the dropdown based on the search input
function updateDropdown(searchInput, dropdownContent, searchData, searchInput1Clicked) {
    const dataSet = searchData
    const searchTerm = searchInput.property('value').toLowerCase();
    const filteredData = dataSet.filter(item => {
        if (item.isSong) {
            return (item.track +item.artist).toLowerCase().includes(searchTerm)
        } else {
            return item.artist.toLowerCase().includes(searchTerm)
        }
    });

    // Clear previous items
    dropdownContent.html('');

    // Add filtered items to the dropdown
    filteredData.forEach(item => {
        let dropdownItem = undefined;
        if (item.isSong) {
            dropdownItem = dropdownContent.append('div')
            .attr("id", item.id)
            .classed('dropdown-item', true)
            .text(`(Song) ${item.artist} - ${item.track}`);
        } else {
            dropdownItem = dropdownContent.append('div')
            .attr("id", item.artist)
            .classed('dropdown-item', true)
            .text(`(Artist) ${item.artist}`);
        }

        dropdownItem.on('click', () => {
            searchInput.property('value', item.isSong ? item.track:item.artist);
            dropdownContent.style('display', 'none');
            searchInput1Clicked(item.isSong, item.isSong ?  item.id:item.artist)   
        });
    });

    // Show/hide the dropdown based on the search input
    if (filteredData.length > 0) {
        dropdownContent.style('display', 'block');
    } else {
        dropdownContent.style('display', 'none');
    }
}