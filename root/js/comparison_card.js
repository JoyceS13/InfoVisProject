const {createApp, ref} = Vue

//debounce function to speed up search
function debounce(func, timeout = 100) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

const SelectSearchComponent = {
    template: `
      <div v-if="searchData!=undefined">
        <input type="text"
               v-model="searchTerm"
               :placeholder="placeholder"
               @blur="exit()"
               @focus="showOptions()"
               @input="handleDebouncedInput">
        <div class="dropdown-content"
             v-show="optionsShown">
          <div v-if="searchTerm.length > 0" v-for="item in filteredData" :key="item.isSong? item.id:item.artist"
               @mousedown="optionClicked(item)"
               class="dropdown-item">
            <div v-if="item.isSong">
              (Song) {{ item.artist }} - {{ item.track }}
            </div>
            <div v-else>
              (Artist) {{ item.artist }}
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
            const filtered = [];
            const regOption = new RegExp(this.searchTerm, 'ig');
            for (const option of this.searchData) {
                if (this.searchTerm.length < 1 || option.isSong? (option?.track + option?.artist).match(regOption): option.artist?.match(regOption)){
                    filtered.push(option);
                }
            }
            return filtered;
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
            console.log(this.selected)
            this.$emit('selected', this.selected)
        },
        showOptions() {
            this.optionsShown = true;
        },
        exit() {
            this.optionsShown = false;
        },
        // Apply the debounce to handleInput method
        handleDebouncedInput: debounce(function () {
            this.optionsShown = true;
        })
    }
}

const RadarChartComponent = {
    template: `<div>Radar Chart</div>`
}

const InfoCardComponent = {
    template: `<div>
                   <div v-if="data === undefined || isSong === undefined">Loading</div>
                   <div v-else>
                    <div v-if="isSong">
                      <div class="info_card_header">{{ data.Track }}</div>
                      <div>
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
                    </div>
                   <div v-if="!isSong">
                     <div class="info_card_header">{{artist_info.Artist}}</div>
                     <div>
                        <div>Spotify streams:</div>
                        <div>{{artist_info.Stream}} </div>
                        <div>YouTube views: </div>
                        <div>{{artist_info.Views}}</div>
                        <div>YouTube interactions: </div>
                        <div> {{artist_info.Interactions}} </div>
                     </div>
                    </div>  
                    
                   </div>
                   
                </div>`,
    props: ["isSong", "data"],
    computed:{
        interactions(){
            if (this.data === undefined){
                return undefined
            }
            return parseInt(this.data.Likes) + parseInt(this.data.Comments)
        },
        artist_info(){
            if (this.data === undefined){
                return undefined
            }
            return {
                Artist: this.data[0].Artist,
                Stream: this.data.map(row => parseInt(row.Stream)).reduce((acc, current) => acc + current, 0),
                Views: this.data.map(row => parseInt(row.Views)).reduce((acc, current) => acc + current, 0),
                Interactions: this.data.map(row => parseInt(row.Likes)).reduce((acc, current) => acc + current, 0) +
                this.data.map(row =>parseInt( row.Comments)).reduce((acc, current) => acc + current, 0)
            }
        }
    }
}

const ComparisonCard = {
    components: {
        SelectSearchComponent,
        RadarChartComponent,
        InfoCardComponent
    },
    template: `
                <div>
                    <div id="comparison_card_header">Comparison Card</div>
                    <RadarChartComponent></RadarChartComponent>
                    <SelectSearchComponent :searchData = "searchData"
                                           @selected="selected1"></SelectSearchComponent>
                    <SelectSearchComponent :searchData = "searchData"
                                           @selected="selected2"></SelectSearchComponent>
                    <InfoCardComponent  v-show="songData != undefined"
                                        :isSong="selection1.isSong"
                                        :data="data1"></InfoCardComponent>
                    <InfoCardComponent v-show="selection2.displayed"
                                       :isSong="selection2?.isSong"
                                       :data="data2"></InfoCardComponent>
                </div>`,
    data() {
        return {
            selection1: {
                isSong: true,
                idOrArtist: 1
            },
            selection2: {
                isSong: true,
                idOrArtist: 1,
                displayed: false
            }
        }
    },
    props: {
        songData: Array
    },
    computed: {
        searchData() {
            //extract columns necessary to search for artists
            const artistSearchSet = new Set();
            this.songData.forEach(row => artistSearchSet.add(row.Artist))
            const artistSearchData = Array.from(artistSearchSet).map(item => {
                return {
                    artist: item,
                    isArtist: true,
                    isSong: false,
                }
            })

            //extract columns necessary to search for songs
            const songSearchData = this.songData.map((row, index) => {
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
                data1 = this.songData[this.selection1.idOrArtist]
            } else {
                data1 = this.songData.filter(row => row.Artist === this.selection1.idOrArtist)
            }
            return data1
        },
        data2() {
            let data2
            if(this.selection2 === undefined){
                return undefined
            }
            if (this.selection2.isSong) {
                data2 = this.songData[this.selection2.idOrArtist]
            } else {
                data2 = this.songData.filter(row => row.Artist === this.selection2.idOrArtist)
            }
            return data2
        }
    },
    methods: {
        selected1(selected) {
            console.log(selected)
            if(JSON.stringify(selected) === '{}'){
                this.selection1 = {
                    isSong: true,
                    idOrArtist: 1
                }
            } else {
                this.selection1 = {
                    isSong: selected.isSong,
                    idOrArtist: selected.idOrArtist
                }
            }
        },
        selected2(selected) {
            if(JSON.stringify(selected) === '{}'){
                this.selection2 = {
                    isSong: true,
                    idOrArtist: 1,
                    displayed: false
                }
            } else {
                this.selection2 = {
                    isSong: selected.isSong,
                    idOrArtist: selected.idOrArtist,
                    displayed: true
                }
            }
        }
    }

}

createApp({
    components: {
        ComparisonCard
    },
    template: `
      <div v-if="loading">Loading</div>
    <div v-else>
        <ComparisonCard :songData="dataset"></ComparisonCard>
    </div>
    `,
    data() {
        return {
            dataset: null,
            loading: true,
        };
    },
    async mounted() {
        await this.loadDataset();
    },
    methods: {
        async loadDataset() {
            // Check if window.dataset is already defined
            if (window.dataset) {
                this.dataset = window.dataset;
                this.loading = false;
                return;
            }

            // If not defined, wait for it
            await new Promise((resolve) => {
                const checkDataset = () => {
                    if (window.dataset) {
                        this.dataset = window.dataset;
                        this.loading = false;
                        resolve();
                    } else {
                        setTimeout(checkDataset, 100); // Check again after 100ms
                    }
                };
                checkDataset();
            });
        },
    }
}).mount('#comparison-card')
