// displays the popularity score of the selected song or artist

export const PopularityScoreComponent = {
    template: `
      <div class=" space-y-1.5 text-center">
        <div class="text-xs"> This {{ isSong ? "track" : "artist" }} is more popular than</div>
        <div class="text-4xl"> {{ percentage }}</div>
        <div class="text-xs">of all {{ isSong ? "tracks" : "artists" }}.</div>
      </div>`,
    props: {
        songData: Object,
        artistData: Object,
        isSong: Boolean,
        idOrArtist: String
    },
    computed: {
        //calculates the popularity score of the selected song or artist
        score() {
            if (this.songData === undefined || this.artistData === undefined || this.idOrArtist === undefined) {
                return -1
            } else {
                //pulls from songData if isSong is true, otherwise pulls from artistData
                //both songData and artistData are sorted by popularity
                // so the index of the selected song/artist is used to calculate the score
                if (this.isSong) {
                    const index = this.songData.findIndex(row => row.track_id === this.idOrArtist)
                    return ((this.songData.length - index) / this.songData.length)
                } else {
                    const index = this.artistData.findIndex(row => row.Artist === this.idOrArtist)
                    return ((this.artistData.length - index) / this.artistData.length)
                }
            }
        },
        //formats the popularity score as a percentage
        percentage() {
            return d3.format(".0%")(this.score)
        }
    },
    methods: {
        //changes the opacity of the card based on the popularity score
        changeOpacity() {
            d3.select("#popularity_score").style("background-color", "rgba(217, 93, 65," + this.score +")")
            if (this.score < 0.6) {
                d3.select("#popularity_score").style("color", "#000")
            } else {
                d3.select("#popularity_score").style("color", "#fff")

            }
        }
    },
    watch: {
        //makes sure the opacity is updated when the score changes
        isSong() {
            this.changeOpacity()
        },
        idOrArtist() {
            this.changeOpacity()
        }
    }
}