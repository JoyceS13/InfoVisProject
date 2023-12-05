class InfoCard{
    constructor(container, type, data){
        this.container = container;
        this.type = type;
        this.data = data;

        var infocard = d3.select(container).append("div").attr("class", "info_card");
        var infocard_header = infocard.append("div").attr("class", "info_card_header");
        var info_card_body = infocard.append("div").attr("class", "info_card_body");

        if(type==="song"){
            this.add_song_info(infocard);
        } else if (type === "artist"){
            this.add_artist_info(infocard);
        };   
    }

    add_song_info(info_card){
        info_card.select(".info_card_header").text("Song title");
        var body = info_card.select(".info_card_body")
        body.append("p").text("Artist: ")
            .append("p").text("Album: ")
            .append("p").text("Key:")
            .append("p").text("Tempo:")
            .append("p").text("Spotify streams:")
            .append("p").text("YouTube views:")
            .append("p").text("YouTube interactions:")
            .append("p").text("Spotify URL:")
            .append("p").text("YouTube URL:");

    }

    add_artist_info(info_card){
        info_card.select(".info_card_header").text("Artist name");
        var body = info_card.select(".info_card_body")
        body.append("p").text("Spotify streams: ")
            .append("p").text("YouTube views: ")
            .append("p").text("YouTube interactions:");
    }
}