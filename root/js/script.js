function optionChanged(isSong, idOrArtist) {
    let genres;
    if (isSong) {
        genres = window.dataset.filter(row => row[''] == idOrArtist).map(row => row.track_genre);
    }else {
        genres = window.dataset.filter(row => row['Artist'] == idOrArtist).map(row => row.track_genre);
    }
    highlightBars(genres);
    $('#items').val(genres).trigger('change');
}