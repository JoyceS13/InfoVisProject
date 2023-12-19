import {SelectSearchComponent} from "./select_search_component.js";
import {RadarChartComponent} from "./radar_chart_component.js";
import {InfoCardComponent} from "./info_card_component.js";
import {Top10BarChartComponent} from "./bar_chart_component.js";
import {PopularityScoreComponent} from "./popularity_score_component.js";

export const ComparisonCard = {
    components: {
        SelectSearchComponent,
        RadarChartComponent,
        InfoCardComponent,
        Top10BarChartComponent,
        PopularityScoreComponent
    },
    template: `
      <div class="flex flex-row flex-wrap justify-between">
        <div class="flex-1 max-w-72">
          <div class="flex flex-col justify-between ">
            <div class="border-2 rounded-md p-3 m-2">
              <SelectSearchComponent :searchData="searchData"
                                     :clear="clear"
                                     @selected="selected1"></SelectSearchComponent>
            </div>
            <div class="border-2 border-color-purple bg-white rounded-md p-3 m-2">
              <RadarChartComponent v-if="maxTempo > 0"
                                   :data1="data1"
                                   :maxTempo="maxTempo"></RadarChartComponent>
            </div>
          </div>
        </div>
        <div class="flex-1 w-72">
          <div class="flex flex-col justify-between">
            <div class="border-2 rounded-md p-3 m-2">
              <InfoCardComponent v-show="songData"
                                 :data="data1"></InfoCardComponent>
            </div>
            <div class="border-2 rounded-md p-5 m-2">
              <PopularityScoreComponent v-show="songData"
                                        :songData="songData"
                                        :artistData="artistPopularityData"
                                        :isSong="data1.isSong"
                                        :id-or-artist="selection1.idOrArtist"></PopularityScoreComponent>
            </div>
          </div>
        </div>
        <div class="flex-1 basis-2/5">
          <div class="flex flex-col justify-evenly">
            <div id="song-barchart" class="flex-1 border-2 rounded-md p-3 m-2 ">
              <Top10BarChartComponent v-show="songData"
                                      :data="songData"
                                      :is-song="true"
                                      :component-id="song_barchart"
                                      @barClick="songSelected"
              ></Top10BarChartComponent>
            </div>
            <div id="artist-barchart" class="flex-1 border-2 rounded-md p-3 m-2">
              <Top10BarChartComponent v-if="artistPopularityData !== undefined"
                                      :data="artistPopularityData"
                                      :is-song="false"
                                      :component-id="artist_barchart"
                                      @barClick="artistSelected"
              ></Top10BarChartComponent>
            </div>
          </div>
        </div>
      </div>`,
    data() {
        return {
            selection1: {
                isSong: true,
                idOrArtist: "0d28khcov6AiegSCpG5TuT"
            },
            maxTempo: 0,
            searchData: undefined,
            song_barchart: "song-barchart",
            artist_barchart: "artist-barchart",
            artistPopularityData: undefined,
            clear: false
        }
    },
    props: {
        songData: Array
    },
    computed: {
        data1() {
            return this.getData(this.selection1)
        }
    },
    methods: {
        selected1(selected) {
            if (JSON.stringify(selected) === '{}') {
                this.selection1 = {
                    isSong: true,
                    idOrArtist: "0d28khcov6AiegSCpG5TuT"
                }
            } else {
                this.selection1 = {
                    isSong: selected.isSong,
                    idOrArtist: selected.idOrArtist
                }
            }
        },
        artist_info(artistData) {
            if (artistData === undefined) {
                return undefined
            }

            const genreSet = new Set()
            artistData.forEach(row => row.Genre.forEach(genre => genreSet.add(genre)))

            return {
                Stream: artistData.map(row => parseInt(row.Stream)).reduce((acc, current) => acc + current, 0),
                Views: artistData.map(row => parseInt(row.Views)).reduce((acc, current) => acc + current, 0),
                Likes: artistData.map(row => parseInt(row.Likes)).reduce((acc, current) => acc + current, 0),
                Comments: artistData.map(row => parseInt(row.Comments)).reduce((acc, current) => acc + current, 0),
                popularity: artistData.map(row => parseInt(row.popularity)).reduce((acc, current) => acc + current, 0) / artistData.length,
                Danceability: artistData.map(row => parseFloat(row.Danceability)).reduce((acc, current) => acc + current, 0) / artistData.length,
                Energy: artistData.map(row => parseFloat(row.Energy)).reduce((acc, current) => acc + current, 0) / artistData.length,
                Valence: artistData.map(row => parseFloat(row.Valence)).reduce((acc, current) => acc + current, 0) / artistData.length,
                Tempo: artistData.map(row => parseFloat(row.Tempo)).reduce((acc, current) => acc + current, 0) / artistData.length,
                Loudness: artistData.map(row => parseFloat(row.Loudness)).reduce((acc, current) => acc + current, 0) / artistData.length,
                Genre: genreSet,
                TopTrack: artistData.sort((a, b) => parseInt(b.Stream) + parseInt(b.Views) + parseInt(b.Likes) + parseInt(b.Comments)
                    - parseInt(a.Stream) - parseInt(a.Views) - parseInt(a.Likes) - parseInt(a.Comments))[0].Track,
                NumberOfTracks: artistData.length

            }
        },
        getData(selection) {
            let retrievedData
            if (selection.isSong) {
                retrievedData = this.songData.find(row => row.track_id === selection.idOrArtist)
                retrievedData.isSong = true
            } else {
                const artistData = this.songData.filter(row => row.Artist.has(selection.idOrArtist))
                retrievedData = this.artist_info(artistData)
                retrievedData.Artist = selection.idOrArtist
                retrievedData.isSong = false
            }
            return retrievedData
        },
        songSelected(id) {
            this.selection1 = {
                isSong: true,
                idOrArtist: id
            }
            this.clear = true
        },
        artistSelected(artist) {
            this.selection1 = {
                isSong: false,
                idOrArtist: artist
            }
            this.clear = true
        }
    },
    mounted() {
        //get max tempo
        this.maxTempo = d3.max(this.songData, row => parseInt(row.Tempo))
        console.log(this.maxTempo)

        //generate search data
        //extract columns necessary to search for artists
        const artistSearchSet = new Set();
        this.songData.forEach(row => row.Artist.forEach(artist => artistSearchSet.add(artist)))
        const artistSearchData = Array.from(artistSearchSet).map(item => {
            return {
                artist: item,
                isArtist: true,
                isSong: false,
            }
        })

        //extract columns necessary to search for songs
        const songSearchData = this.songData.map(row => {
            return {
                isSong: true,
                isArtist: false,
                id: row.track_id,
                artist: row.Artist,
                track: row.Track
            }
        })

        //return combined information for artists and songs
        this.searchData = [
            ...artistSearchData,
            ...songSearchData
        ]

        //generate artist data
        this.artistPopularityData = []
        artistSearchSet.forEach(artist => {
            const popularity = this.songData
                .filter(row => row.Artist.has(artist))
                .map(row => parseInt(row.popularity))
                .reduce((acc, current) => acc + current, 0);

            // Push data for each artist to the artistData array
            this.artistPopularityData.push({
                Artist: artist,
                popularity: popularity
            });
        });
        this.artistPopularityData.sort((a, b) => b.popularity - a.popularity);
    }

}