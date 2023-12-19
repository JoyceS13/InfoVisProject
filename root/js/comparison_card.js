import {ComparisonCard} from "./Comparison_Card_Components/comparison_card_component.js";

const {createApp} = Vue

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
    data
        () {
        return {
            dataset: null,
            loading: true,
        };
    }
    ,
    async mounted() {
        await this.loadDataset();
    }
    ,
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


        }
        ,
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
            songData.sort((a, b) => b.popularity - a.popularity);
            return songData;
        }
    }
}).mount('#comparison-card')
