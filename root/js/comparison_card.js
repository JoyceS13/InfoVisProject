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
    template: `<div>Radar Chart</div>
        <canvas id="radar_chart"></canvas>`,
    data() {
        return {
            radarChart: null
        }
    },
    props: {
        data1: Object,
        data2: Object,
        data2_displayed: {
            type: Boolean,
            default: false
        },
        maxTempo: Number
    },
    computed: {
        radarData1() {
            if (this.data1 === undefined){
                return [0,0,0,0,0]
            }
            return [this.data1.Danceability, this.data1.Energy, this.data1.Valence, this.data1.Tempo/this.maxTempo, this.loudnessMap(this.data1.Loudness)]
        },
        radarData2() {
            if (this.data2 === undefined){
                return [0,0,0,0,0]
            }
            return [this.data2.Danceability, this.data2.Energy, this.data2.Valence, this.data2.Tempo/this.maxTempo, this.loudnessMap(this.data2.Loudness)]
        }
    },
    mounted() {
        this.createChart()
    },
    methods: {
        createChart() {
            // Configuration options for the radar chart
            const options = {
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
            const ctx = document.getElementById('radar_chart').getContext('2d');
            this.radarChart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Danceability', 'Energy', 'Valence', 'Tempo', 'Loudness'],
                    datasets: [{
                            label: this.data1?.Track,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 2,
                            data: this.radarData1
                        }]
                },
                options: {
                    scale: {
                        ticks: { beginAtZero: true },
                    },
                }
            });
        },
        updateChart() {
            this.radarChart.data.datasets[0].data = this.radarData1
            this.radarChart.data.datasets[0].label = this.data1.isSong? this.data1.Track: this.data1.Artist
            if (this.data2_displayed){
                this.radarChart.data.datasets[1].data = this.radarData2
                this.radarChart.data.datasets[1].backgroundColor = 'rgba(255, 99, 132, 0.2)'
                this.radarChart.data.datasets[1].borderColor = 'rgba(255, 99, 132, 1)'
                this.radarChart.data.datasets[1].borderWidth = 2
                this.radarChart.data.datasets[1].label = this.data2.isSong? this.data2.Track: this.data2.Artist
            }

            this.radarChart.update()
        },
        loudnessMap(loudness){
            return (loudness + 60)/60
        }
    },
    watch: {
        data1: {
            handler: 'updateChart'
        },
        data2: {
            handler: 'updateChart'
        },
        data2_displayed: {
            handler: 'updateChart'
        }
    }
}


const InfoCardComponent = {
    template: `<div>
                   <div v-if="data === undefined">Loading</div>
                   <div v-else>
                    <div v-if="data.isSong">
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
                   <div v-if="!data.isSong">
                     <div class="info_card_header">{{data.Artist}}</div>
                     <div>
                        <div>Spotify streams:</div>
                        <div>{{data.Stream}} </div>
                        <div>YouTube views: </div>
                        <div>{{data.Views}}</div>
                        <div>YouTube interactions: </div>
                        <div> {{data.Interactions}} </div>
                     </div>
                    </div>  
                    
                   </div>
                   
                </div>`,
    props: ["data"],
    computed:{
        interactions(){
            if (this.data === undefined){
                return undefined
            }
            return parseInt(this.data.Likes) + parseInt(this.data.Comments)
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
                    <RadarChartComponent :data1="data1"
                    :data2="data2"
                    :data2_displayed="selection2.displayed"
                    :maxTempo="maxTempo"></RadarChartComponent>
                    <SelectSearchComponent :searchData = "searchData"
                                           @selected="selected1"></SelectSearchComponent>
                    <SelectSearchComponent :searchData = "searchData"
                                           @selected="selected2"></SelectSearchComponent>
                    <InfoCardComponent  v-show="songData != undefined"
                                        :data="data1"></InfoCardComponent>
                    <InfoCardComponent v-show="selection2.displayed"
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
            },
            maxTempo: 0,
            searchData: undefined
        }
    },
    props: {
        songData: Array
    },
    computed: {
        data1() {
            return this.getData(this.selection1)
        },
        data2() {
            return this.getData(this.selection2)
        }
    },
    methods: {
        selected1(selected) {
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
        },
        artist_info(artistData){
            if (artistData === undefined){
                return undefined
            }
            return {
                Artist: artistData[0].Artist,
                Stream: artistData.map(row => parseInt(row.Stream)).reduce((acc, current) => acc + current, 0),
                Views: artistData.map(row => parseInt(row.Views)).reduce((acc, current) => acc + current, 0),
                Interactions: artistData.map(row => parseInt(row.Likes)).reduce((acc, current) => acc + current, 0) +
                    artistData.map(row =>parseInt( row.Comments)).reduce((acc, current) => acc + current, 0),
                Danceability: artistData.map(row => parseFloat(row.Danceability)).reduce((acc, current) => acc + current, 0)/artistData.length,
                Energy: artistData.map(row => parseFloat(row.Energy)).reduce((acc, current) => acc + current, 0)/artistData.length,
                Valence: artistData.map(row => parseFloat(row.Valence)).reduce((acc, current) => acc + current, 0)/artistData.length,
                Tempo: artistData.map(row => parseFloat(row.Tempo)).reduce((acc, current) => acc + current, 0)/artistData.length,
                Loudness: artistData.map(row => parseFloat(row.Loudness)).reduce((acc, current) => acc + current, 0)/artistData.length
            }
        },
        getData(selection){
            let retrievedData
            if (selection.isSong) {
                retrievedData = this.songData[selection.idOrArtist]
                retrievedData.isSong = true
            } else {
                const artistData = this.songData.filter(row => row.Artist === selection.idOrArtist)
                retrievedData = this.artist_info(artistData)
                console.log(retrievedData)
                retrievedData.isSong = false
            }
            return retrievedData
        }
    },
    mounted() {
        //get max tempo
        this.maxTempo = Math.max(...this.songData.map(row => parseInt(row.Tempo)))

        //generate search data
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
        this.searchData = [
            ...artistSearchData,
            ...songSearchData
        ]
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
