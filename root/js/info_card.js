class InfoCard{
    constructor(id, type){
        this.id = id;
        this.type = type;
        this.data;

        this.update_info(id)
    }   

    //updates the information
    update_info(){
        var info_card = d3.select(this.id)

        let header_text
        let body_text

        //adds information depending on whether an artist or song is selected
        if(this.type==="song"){
            [header_text, body_text] = this.generate_song_info()
            info_card.style("display","inline");
        } else if (this.type === "artist"){
            [header_text, body_text] = this.generate_artist_info()
            info_card.style("display","inline");
        } else{
            info_card.style("display","none");
        };   

        info_card.select(".info_card_header").html(header_text);
        info_card.select(".info_card_body").html(body_text);
    }

    generate_song_info(){
        let header = "Song title"
        let text = `
            <div>
                <div>Artist</div>
                <div></div>
            </div>
            <div>
                <div>Album</div>
                <div></div>
            </div>
            <div>
                <div>Key</div>
                <div></div>
            </div>
            <div>
                <div>Tempo</div>
                <div> </div>
            </div>
            <div>
                <div>Spotify streams</div>
                <div></div>
            </div>
            <div>
                <div> YouTube views </div>
                <div> </div>
            </div>
            <div>
                <div> YouTube interactions </div>
                <div> </div>
            </div>
            <div>
                <div> Spotify URL</div>
                <div> </div>
            </div>
            <div>
                <div> YouTube URL </div>
                <div> </div>
            </div>
            `
        return [header, text];
    }

    //adds the information if an artist is selected
    generate_artist_info(){
        let header = "Artist name";
        let text = `
            <div>
                <div>Spotify streams:</div>
                <div> </div>
            </div>
            <div>
                <div>YouTube views: </div>
                <div></div>
            </div>
            <div>
                <div>YouTube interactions: </div>
                <div> </div>
            </div>
            `;
        return [header, text];
    }

    hide(){
        d3.select(this.id).style("display","none");
    }

    //sets a new type: song or artist for the infocard, automatically updates infocard
    setType(type){
        this.type = type;
        this.update_info()
        //TODO set automatic data (first artist or song)
    }

    //sets new data as the data displayed on the infocard
    setData(data){
        this.data = data;
    }
} 