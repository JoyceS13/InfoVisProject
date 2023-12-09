const {createApp} = Vue

const SelectSearchComponent = {
    template: `<div>
                    <input type="text" class="search-input" placeholder="Search songs/artists">
                    <div class="dropdown-content"></div>
                </div>`
}

const RadarChartComponent = {
    template: `<div>Radar Chart</div>`
}

const InfoCardComponent = {
    template: `<div>
                   <div class="info_card_header">Info Card</div>
                   <div v-if="data === undefined">Loading</div>
                   <div v-else>
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
                            <div>{{data.Likes + data.Comments}}</div>
                            <div>Spotify URL</div>
                            <div>{{data.Url_spotify}}</div>
                            <div>YouTube URL</div>
                            <div>{{data.Url_youtube}}</div>                     
                    </div>
                   <div >
                        <div>Spotify streams:</div>
                        <div>{{data.Stream}} </div>
                        <div>YouTube views: </div>
                        <div>{{data.Views}}</div>
                        <div>YouTube interactions: </div>
                        <div> </div>
                    </div>  
                    
                   </div>
                   
                </div>`,
    props: ["isSong", "data"]
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
                    <SelectSearchComponent></SelectSearchComponent>
                    <SelectSearchComponent></SelectSearchComponent>
                    <InfoCardComponent></InfoCardComponent>
                    <InfoCardComponent></InfoCardComponent>
                </div>`
}

createApp({
    components: {
        ComparisonCard
    },
    template: `
    <div>
        <ComparisonCard></ComparisonCard>
    </div>
    `
}).mount('#app')
