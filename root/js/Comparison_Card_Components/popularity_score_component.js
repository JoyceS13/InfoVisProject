export const PopularityScoreComponent = {
    template: `
      <div class=" space-y-1.5 text-center">
        <div class="text-xs"> This {{ isSong ? "track" : "artist" }} is more popular than</div>
        <div class="text-4xl"> {{ score }}</div>
        <div class="text-xs">of all {{ isSong ? "tracks" : "artists" }}.</div>
      </div>`,
    props: {
        songData: Object,
        artistData: Object,
        isSong: Boolean,
        idOrArtist: String
    },
    computed: {
        score() {
            if (this.songData === undefined || this.artistData === undefined || this.idOrArtist === undefined) {
                return -1
            } else {
                if (this.isSong) {
                    const index = this.songData.findIndex(row => row.track_id === this.idOrArtist)
                    return d3.format(".0%")((this.songData.length - index) / this.songData.length)
                } else {
                    const index = this.artistData.findIndex(row => row.Artist === this.idOrArtist)
                    return d3.format(".0%")((this.artistData.length - index) / this.artistData.length)
                }
            }
        }
    }
}