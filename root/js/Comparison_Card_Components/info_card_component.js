// displays the information for the selected artist or song

export const InfoCardComponent = {
    template: `
      <div v-if="data === undefined">Loading</div>
      <div v-else class="flex flex-col min-w-full">
        <div v-if="data.isSong" class="space-y-1 min-w-400">
          <div class="info_card_header text-xl min-w-full font-semibold text-center">{{ data.Track }}</div>
          <div class="grid gap-0.5 grid-cols-2  grid-rows-10 whitespace-normal auto-rows-min object-left">
              <div class="font-medium">Artist</div>
              <div>{{ Array.from(data.Artist).join(', ') }}</div>
              <div class="font-medium">Album</div>
              <div>{{ data.Album }}</div>
              <div class="font-medium">Key</div>
              <div>{{ key }}</div>
              <div class="font-medium">Tempo</div>
              <div>{{ tempo }}</div>
              <div class="font-medium">Duration</div>
              <div>{{ duration }}</div>
              <div class="font-medium">Genres</div>
              <div class="capitalize">{{ Array.from(data.Genre).join(', ') }}</div>
              <div class="font-medium">Spotify streams</div>
              <div>{{ streams}}</div>
              <div class="font-medium">YouTube views</div>
              <div>{{ views }}</div>
              <div class="font-medium">YouTube interactions</div>
              <div class="align-middle">{{ interactions }}</div>
              <div class="font-medium">Total popularity</div>
              <div>{{ popularity }}</div>
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
        <div v-if="!data.isSong" class="space-y-1">
          <div class="info_card_header text-xl font-semibold">{{ data.Artist }}</div>
          <div class="grid grid-cols-2 grid-rows-7 gap-0.5 whitespace-normal auto-rows-min align-middle">
              <div class="font-medium">Number of tracks</div>
              <div>{{ data.NumberOfTracks }}</div>
              <div class="font-medium">Top track</div>
              <div>{{ data.TopTrack }}</div>
              <div class="font-medium">Genres</div>
              <div class="capitalize">{{ Array.from(data.Genre).join(', ') }}</div>
              <div class="font-medium">Spotify streams</div>
              <div>{{ streams }}</div>
              <div class="font-medium">YouTube views</div>
              <div>{{ views }}</div>
              <div class="font-medium">YouTube interactions</div>
              <div> {{ interactions }}</div>
                <div class="font-medium">Total popularity</div>
              <div>{{ popularity }}</div>
          </div>
        </div>

      </div>`,
    props: ["data"],
    computed: { //formats all the numbers for display
        interactions() {
            if (this.data === undefined) {
                return undefined
            }
            return this.formatNumber(parseInt(this.data.Likes) + parseInt(this.data.Comments))
        },
        streams() {
            if (this.data === undefined) {
                return undefined
            }
            return this.formatNumber(parseInt(this.data.Stream))
        },
        views() {
            if (this.data === undefined) {
                return undefined
            }
            return this.formatNumber(parseInt(this.data.Views))
        },
        popularity() {
            if (this.data === undefined) {
                return undefined
            }
            return this.formatNumber(parseInt(this.data.popularity))
        },
        key() {
            if (this.data === undefined) {
                return undefined
            }
            const formatKey = d3.format("d")
            return formatKey(this.data.Key)
        },
        tempo() {
            if (this.data === undefined) {
                return undefined
            }
            const formatTempo = d3.format(".1f")
            return formatTempo(this.data.Tempo)
        },
        duration() {
            if (this.data === undefined) {
                return undefined
            }
            const formatTime = d3.timeFormat("%-M min %-S sec");
            return formatTime(new Date(parseInt(this.data.Duration_ms)))
        }
    },
    methods: {
        //custom formatting to show B for billions instead of G for giga
        formatNumber(value) {
            const customFormat = d3.format(".3~s"); // Use ~ to suppress trailing zeros

            if (value >= 1e9) {
                return customFormat(value / 1e9) + " B";
            } else if (value >= 1e6) {
                return customFormat(value / 1e6) + " M";
            } else if (value >= 1e3) {
                return customFormat(value / 1e3) + " K";
            } else {
                return customFormat(value);
            }
        }
    }
}