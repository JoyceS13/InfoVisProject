function optionChanged(isSong, idOrArtist) {
    data = window.dataset
    console.log(window.dataset)
    console.log(isSong, idOrArtist);
    let genres;
    if (isSong) {
        genres = window.dataset.filter(row => row['track_id'] == idOrArtist).map(row => row.track_genre);

    }else {
        genres = window.dataset.filter(row => row['Artist'] == idOrArtist).map(row => row.track_genre);
    }
    console.log(genres);
    highlightBars(genres);
    let uniqueGenres = [...new Set(genres)];
    
    handleRadioChangeAndInitDensity(data, uniqueGenres)
    $('#items').val(genres).trigger('change');
}