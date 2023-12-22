import {ComparisonCard} from "./Comparison_Card_Components/comparison_card_component.js";

const {createApp} = Vue

//launches vue app/components on the page with the id comparison-card
createApp({
    components: {
        ComparisonCard
    },
    //the charts are loaded only after the data is loaded
    template: `
      <div v-if="loading">Loading</div>
      <div v-else>
        <ComparisonCard :songData="dataset"></ComparisonCard>
      </div>
    `,
    data
        () {
        return {
            dataset: null,
            loading: true,
        };
    }
    ,
    async mounted() {
        // Load dataset
        await this.loadDataset();
    }
    ,
    methods: {
        async loadDataset() {
            // Check if window.dataset is already defined
            if (window.dataset) {
                const loadedData = JSON.parse(JSON.stringify(window.dataset));
                this.dataset = this.cleanData(loadedData);
                this.loading = false;
            }

            // If not defined, wait for it
            await new Promise((resolve) => {
                const checkDataset = () => {
                    if (window.dataset) {
                        const loadedData = JSON.parse(JSON.stringify(window.dataset));
                        this.dataset = this.cleanData(loadedData);
                        this.loading = false;
                        resolve();
                    } else {
                        setTimeout(checkDataset, 100); // Check again after 100ms
                    }
                };
                checkDataset();
            });


        }
        ,
        // Remove duplicate rows, one row per song
        cleanData(data) {
            //find all unique songs
            const songs = new Set();
            data.forEach(row => songs.add(row.track_id));

            const songData = Array.from(songs).map(track_id => data.find(row => row.track_id === track_id));
            //add genres to each song
            songData.forEach(song => song.Genre = new Set(data.filter(row => row.track_id === song.track_id).map(r => r.track_genre)));
            //add artists to each song
            songData.forEach(song => {
                const artistSet = new Set();
                data.filter(row => row.track_id === song.track_id).forEach(row => artistSet.add(row.Artist));
                song.Artist = artistSet;
            });

            //sort songs by popularity
            songData.sort((a, b) => b.popularity - a.popularity);
            return songData;
        }
    }
}).mount('#comparison-card')
