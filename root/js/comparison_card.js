const {createApp} = Vue

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
      <div v-if="searchData===undefined"></div>
      <div v-else>
        <input type="text"
               v-model="searchTerm"
               :placeholder="placeholder"
               @blur="exit()"
               @focus="showOptions()"
               @input="handleDebouncedInput"
                class="object-fill">
        <div class="dropdown-content"
             v-show="optionsShown">
          <div v-if="searchTerm.length > 0" v-for="item in filteredData" :key="item.isSong? item.id:item.artist"
               @mousedown="optionClicked(item)"
               class="dropdown-item">
            <div v-if="item.isSong">
              (Song) {{ Array.from(item.artist).join(', ') }} - {{ item.track }}
            </div>
            <div v-else>
              (Artist) {{ item.artist }}
            </div>
          </div>
        </div>
      </div>`,
    props: {
        name: {
            type: String,
            default: "searchDropdown"
        },
        searchData: Array,
        placeholder: {
            type: String,
            default: "Search songs/artists"
        }
    },
    data() {
        return {
            selected: {},
            searchTerm: "",
            optionsShown: false
        }
    },
    computed: {
        filteredData() {
            const filtered = [];
            const regOption = new RegExp(this.searchTerm, 'ig');
            for (const option of this.searchData) {
                if (this.searchTerm.length < 1 || option.isSong ? (option?.track + Array.from(option?.artist).join(' ')).match(regOption) : option.artist?.match(regOption)) {
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
            optionChanged(item.isSong, item.isSong ? item.id : item.artist)
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
    template: `
      <div>Radar Chart</div>
      <canvas id="radar_chart"></canvas>`,
    data() {
        return {
            radarChart: null
        }
    },
    props: {
        data1: Object,
        maxTempo: Number
    },
    computed: {
        radarData1() {
            if (this.data1 === undefined) {
                return [0, 0, 0, 0, 0]
            }
            console.log(this.data1.Tempo)
            return [this.data1.Danceability, this.data1.Energy, this.data1.Valence, (parseFloat(this.data1.Tempo) / this.maxTempo), this.loudnessMap(parseFloat(this.data1.Loudness))]
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
                        display: true,
                    },
                    pointLabels: {
                        font: {
                            size: 24
                        },
                        color: 'blue',
                    },
                    r: {
                        ticks: {
                            beginAtZero: true,
                            stepSize: 0.2,
                            backdropColor: '#D9D6D2'
                        },
                        min: 0,
                        max: 1
                    },
                    font: {
                        size: 12
                    },
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                responsive: true
            };

            // Get the canvas element and create the radar chart
            const ctx = document.getElementById('radar_chart').getContext('2d');
            const radarChart = new Chart(ctx, {
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
                options: options
            });

            Object.seal(radarChart);
            this.radarChart = radarChart;
        },
        updateChart() {
            if (this.radarChart) {
                this.radarChart.data.datasets[0].data = this.radarData1
                this.radarChart.data.datasets[0].label = this.data1.isSong ? this.data1.Track : this.data1.Artist

                this.radarChart.update()
            }
        },
        loudnessMap(loudness) {
            return (loudness + 60) / 60
        }
    },
    watch: {
        data1: {
            handler: 'updateChart'
        }
    }
}

const InfoCardComponent = {
    template: `
      <div v-if="data === undefined">Loading</div>
      <div v-else class="flex flex-col min-w-full">
        <div v-if="data.isSong" class="flex flex-col min-w-400">
          <div class="info_card_header text-xl min-w-full">{{ data.Track }}</div>
          <div class="flex flex-row grid gap-4 grid-cols-2 justify-between grow-1">
            <div class="min-w-max">
              <div>Artist</div>
              <div>Album</div>
              <div>Key</div>
              <div>Tempo</div>
              <div>Duration</div>
              <div>Genres</div>
              <div class="break-normal whitespace-normal">Spotify streams</div>
              <div class="break-normal whitespace-normal">YouTube views</div>
              <div class="break-normal whitespace-normal">YouTube interactions</div>
            </div>
            <div class="min-w-max">
              <div>{{ Array.from(data.Artist).join(', ') }}</div>
              <div>{{ data.Album }}</div>
              <div>{{ data.Key }}</div>
              <div>{{ data.Tempo }}</div>
              <div>{{ data.Duration_ms }}</div>
              <div class="capitalize">{{ Array.from(data.Genre).join(', ') }}</div>
              <div>{{ data.Stream }}</div>
              <div>{{ data.Views }}</div>
              <div>{{ interactions }}</div>
            </div>
          </div>
          <div class="flex flex-row space-x-2 justify-center mt-4 h-8">
            <div class="h-fit">

              <a :href="data.Url_spotify"><img class="object-cover h-full" src="data/images/spotify_logo.png"></a>

            </div>
            <div class="h-fit">

              <a :href="data.Url_youtube"><img class="object-cover h-full" src="data/images/youtube_logo.png"></a>

            </div>
          </div>
        </div>
        <div v-if="!data.isSong">
          <div class="info_card_header text-xl ">{{ data.Artist }}</div>
          <div class="grid grid-cols-2">
            <div>
              <div>Number of tracks:</div>
              <div>Top track:</div>
              <div>Genres:</div>
              <div class="break-normal whitespace-normal">Spotify streams:</div>
              <div class="break-normal whitespace-normal">YouTube views:</div>
              <div class="break-normal whitespace-normal">YouTube interactions:</div>
            </div>
            <div>
              <div>{{ data.NumberOfTracks }}</div>
              <div>{{ data.TopTrack }}</div>
              <div class="capitalize">{{ Array.from(data.Genre).join(', ') }}</div>
              <div>{{ data.Stream }}</div>
              <div>{{ data.Views }}</div>
              <div> {{ interactions }}</div>
            </div>
          </div>
        </div>

      </div>`,
    props: ["data"],
    computed: {
        interactions() {
            if (this.data === undefined) {
                return undefined
            }
            return parseInt(this.data.Likes) + parseInt(this.data.Comments)
        }
    }
}

const Top10BarChartComponent = {
    template: `
      <div>
        <div>Top 10 Bar Chart</div>
        <div class="top10_bar_chart"></div>
      </div>`,
    data() {
        return {
            barChart: null
        }
    },
    props: {
        data: Object,
        isSong: Boolean,
        componentId: String
    },
    computed: {
        barData() {
            if (this.data === undefined) {
                return [];
            }

            // Create a map to store total popularity for each track or artist
            const popularityMap = new Map();

            // Iterate through the data and update the map
            if (this.isSong) {
                this.data.forEach(row => {
                    const key = row.Track
                    const popularity = parseInt(row.Stream) + parseInt(row.Views) + parseInt(row.Likes) + parseInt(row.Comments);

                    // Update the total popularity in the map
                    popularityMap.set(key, Math.max((popularityMap.get(key) || 0), popularity));
                });
            } else {
                this.data.forEach(row => row.Artist.forEach(artist => {
                    const key = artist
                    const popularity = parseInt(row.Stream) + parseInt(row.Views) + parseInt(row.Likes) + parseInt(row.Comments);

                    // Update the total popularity in the map
                    popularityMap.set(key, Math.max((popularityMap.get(key) || 0), popularity));
                }));
            }

            // Convert the map entries to an array
            const sortedEntries = [...popularityMap.entries()]
                .sort((a, b) => b[1] - a[1]) // Sort by total popularity in descending order

            // Convert the sorted entries back to an array of objects
            const result = sortedEntries.map(([key, totalPopularity]) => {
                return {
                    [this.isSong ? 'Track' : 'Artist']: key,
                    'totalPopularity': totalPopularity
                };
            });

            return result.slice(0, 5);
        }
    },
    methods: {
        createBarChart() {

            const svg_width = 400;
            const svg_height = 175;
            const component = `#${this.componentId}`

            const svg = d3.select(component).select(".top10_bar_chart")
                .append("svg")
                .attr("width", svg_width)
                .attr("height", svg_height)

            const margin = {top: 20, right: 20, bottom: 30, left: 100};
            const width = svg_width - margin.left - margin.right;
            const height = svg_height - margin.top - margin.bottom;

            const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            const y = d3.scaleBand()
                .domain(this.barData.map(d => this.isSong ? d.Track : d.Artist))
                .rangeRound([0, height]).padding(0.1)
            const x = d3.scaleLinear()
                .domain([0, d3.max(this.barData, d => d.totalPopularity)])
                .range([0, width]);

            //TODO: fix axis labels

            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y));

            g.append("g")
                .attr("class", "axis axis--x")
                .call(d3.axisTop(x).ticks(10, "s"))
                .append("text")
                .attr("x", 6)
                .attr("fill", "#000")
                .text("Streams");

            g.selectAll(".bar")
                .data(this.barData)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("y", d => y(this.isSong ? d.Track : d.Artist))
                .attr("x", x(0))
                .attr("height", y.bandwidth())
                .attr("width", d => x(d.totalPopularity));

            this.barChart = svg;
        }
    },
    mounted() {
        this.createBarChart()
    }
}

const ComparisonCard = {
    components: {
        SelectSearchComponent,
        RadarChartComponent,
        InfoCardComponent,
        Top10BarChartComponent
    },
    template: `
      <div class="flex flex-col">
        <div class="info_card_header">Comparison Card</div>

        <div class="flex flex-row flex-wrap justify-evenly">
          <div class="flex-1 shrink-0">
            <div class="flex flex-col justify-center space-y-10">
              <div class="border-2 rounded p-3 m-2 justify-center">
            <SelectSearchComponent :searchData="searchData"
                                   @selected="selected1"></SelectSearchComponent>
              </div>
              <div class="border-2-[#B6F2D0] bg-white rounded p-3 m-2">
            <RadarChartComponent v-if="maxTempo > 0"
                                 :data1="data1"
                                 :maxTempo="maxTempo"></RadarChartComponent>
              </div>
              </div>
          </div>
          <div class="flex-1 shrink-0 min-w-500">
            <InfoCardComponent v-show="songData"
                               :data="data1"></InfoCardComponent>
          </div>
          <div class="flex-1 shrink-0">
            <div class="flex flex-col justify-evenly">
              <div id="song-barchart" class="flex-1 border-2 rounded p-3 m-2 ">
                <Top10BarChartComponent
                    :data="songData"
                    :is-song="true"
                    :component-id="song_barchart"
                ></Top10BarChartComponent>
              </div>
              <div id="artist-barchart" class="flex-1 border-2 rounded p-3 m-2">
                <Top10BarChartComponent
                    :data="songData"
                    :is-song="false"
                    :component-id="artist_barchart"
                ></Top10BarChartComponent>
              </div>
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
            artist_barchart: "artist-barchart"
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
                const loadedData = window.dataset;
                this.dataset = this.cleanData(loadedData);
                this.loading = false;
            }

            // If not defined, wait for it
            await new Promise((resolve) => {
                const checkDataset = () => {
                    if (window.dataset) {
                        const loadedData = window.dataset;
                        this.dataset = this.cleanData(loadedData);
                        this.loading = false;
                        resolve();
                    } else {
                        setTimeout(checkDataset, 100); // Check again after 100ms
                    }
                };
                checkDataset();
            });


        },
        // Remove duplicate rows
        cleanData(data) {
            const songs = new Set();
            data.forEach(row => songs.add(row.track_id));
            const songData = Array.from(songs).map(track_id => data.find(row => row.track_id === track_id));
            songData.forEach(song => song.Genre = new Set(data.filter(row => row.track_id === song.track_id).map(r => r.track_genre)));
            const artists = new Set();
            songData.forEach(song => {
                const artistSet = new Set();
                data.filter(row => row.track_id === song.track_id).forEach(row => artistSet.add(row.Artist));
                song.Artist = artistSet;
            });
            return songData;
        }
    }
}).mount('#comparison-card')
