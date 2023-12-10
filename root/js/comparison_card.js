const {createApp} = Vue

const SelectSearchComponent = {
    template: `<div v-if="searchData!=undefined">
                    <input type="text" 
                           v-model="searchTerm"
                           :placeholder="placeholder"
                           @mousedown="showOptions()"
                           @blur="exit()"
                           @keyup="showOptions()">
                    <div class="dropdown-conten"
                         v-show="optionsShown">
                            showing items now
                        <div v-for="item in filteredData"
                             @mousedown="optionClicked(item)"
                             class="dropdown-item">
                            <div v-if="item.isSong">
                            (Song) {{item.artist}} - {{item.track}}
                            </div>
                            <div v-else>
                            (Artist) {{item.artist}}
                            </div>
                        </div>
                    </div>
                </div>`,
    props: {
        name : {
            type: String,
            default: "searchDropdown"
        },
        searchData: Array,
        placeholder:{
                type: String,
                default:"Search songs/artists"
        }
    },
    data() {
        return {
            selected: {},
            searchTerm: "",
            optionsShown: false
        }
    },
    created() {
        this.$emit('selected', this.selected)
    },
    computed: {
        filteredData() {
            return this.searchData.filter(item => {
                if (item.isSong) {
                    return (item.track +item.artist).toLowerCase().includes(this.searchTerm.toLowerCase())
                } else {
                    return item.artist.toLowerCase().includes(this.searchTerm.toLowerCase())
                }
            });
        }
    },
    methods: {
        optionClicked(item) {
            this.selected = {
                isSong: item.isSong,
                idOrArtist: item.isSong ? item.id : item.artist
            }
            this.searchTerm = item.isSong ? item.track : item.artist
            this.optionsShown = false;
            this.$emit('selected', this.selected)
        },
        showOptions() {
            this.optionsShown = true;
        },
        exit() {
            this.optionsShown = false;
        }
    }
}

const RadarChartComponent = {
    template: `<div>Radar Chart</div>`
}

const InfoCardComponent = {
    template: `<div>
                   <div class="info_card_header">Info Card</div>
                   <div v-if="data === undefined || isSong === undefined">Loading</div>
                   <div v-else>
                    <div v-if="isSong">
                          <div>Artist</div>
                          <div>{{data.Artist}}</div>
                          <div>Album</div>
                            <div>{{data.Album}}</div>
                            <div>Key</div>
                            <div>{{data.Key}}</div>
                            <div>Tempo</div>
                            <div>{{data.Tempo}}</div>
                            <div>Spotify streams</div>
                            <div>{{data.Stream}}</div>
                            <div>YouTube views</div>
                            <div>{{data.Views}}</div>
                            <div>YouTube interactions</div>
                            <div>{{interactions}}</div>
                            <div>Spotify URL</div>
                            <div>{{data.Url_spotify}}</div>
                            <div>YouTube URL</div>
                            <div>{{data.Url_youtube}}</div>                     
                    </div>
                   <div v-if="!isSong">
                        <div>Spotify streams:</div>
                        <div>{{data.Stream}} </div>
                        <div>YouTube views: </div>
                        <div>{{data.Views}}</div>
                        <div>YouTube interactions: </div>
                        <div> </div>
                    </div>  
                    
                   </div>
                   
                </div>`,
    props: ["isSong", "data"],
    computed:{
        interactions(){
            return this.data?.Likes + this.data?.Comments
        }
    }
}

const ComparisonCard = {
    components: {
        SelectSearchComponent,
        RadarChartComponent,
        InfoCardComponent
    },
    data() {
        return {
            count: 0
        }
    }, template: `
                <div>
                    <div id="comparison_card_header">Comparison Card</div>
                    <RadarChartComponent></RadarChartComponent>
                    <SelectSearchComponent :searchData = "searchData"
                                           @selected="selection1"></SelectSearchComponent>
                    <SelectSearchComponent :searchData = "searchData"
                                           @selected="selection2"></SelectSearchComponent>
                    <InfoCardComponent :isSong="selection1.isSong"
                                        :data="data1"></InfoCardComponent>
                    <InfoCardComponent v-show="selection2 != undefined"
                                       :isSong="selection2?.isSong"
                                       :data="data2"></InfoCardComponent>
                  {{selection1}}
                </div>`,
    props: {
        data: Array,
        selection1: {
            type: Object,
            default: {
                isSong: true,
                idOrArtist: 1
            }
        },
        selection2: {
            type: Object,
            default: undefined
        }
    },
    computed: {
        searchData() {
            //extract columns necessary to search for artists
            const artistSearchSet = new Set();
            this.data.forEach(row => artistSearchSet.add(row.Artist))
            const artistSearchData = Array.from(artistSearchSet).map(item => {
                return {
                    artist: item,
                    isArtist: true,
                    isSong: false,
                }
            })

            //extract columns necessary to search for songs
            const songSearchData = this.data.map((row, index) => {
                return {
                    isSong: true,
                    isArtist: false,
                    id: index,
                    artist: row.Artist,
                    track: row.Track

                }
            })

            //return combined information for artists and songs
            return [
                ...artistSearchData,
                ...songSearchData
            ]
        },
        data1() {
            let data1
            if (this.selection1.isSong) {
                data1 = this.data[this.selection1.idOrArtist]
            } else {
                data1 = this.data.filter(row => row.Artist === this.selection1.idOrArtist)
            }
            return data1
        },
        data2() {
            let data2
            if(this.selection2 === undefined){
                return undefined
            }
            if (this.selection2.isSong) {
                data2 = this.data[this.selection2.idOrArtist]
            } else {
                data2 = this.data.filter(row => row.Artist === this.selection2.idOrArtist)
            }
            return data2
        }
    }
}

createApp({
    components: {
        ComparisonCard
    },
    template: `
    <div v-if="data != undefined">
        <ComparisonCard :data="data"></ComparisonCard>
    </div>
    `,
    data() {
        return {
            data: undefined
        }
    },
    async mounted() {
        this.data = await d3.csv("data/Spotify_Youtube.csv")
        console.log(this.data)
    }
}).mount('#app')
