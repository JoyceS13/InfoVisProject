//displays a search bar with dropdown options

//debounce function to speed up search
function debounce(func, timeout = 100, initialWait = false) {
    let timer;
    let initialTimer;

    return function (...args) {
        // Clear the initial timer if it exists
        clearTimeout(initialTimer);

        if (!timer && initialWait) {
            // If initialWait is true, set an initial timer
            initialTimer = setTimeout(() => {
                func.apply(this, args);
            }, timeout);
        } else {
            // Debounce subsequent calls
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
            }, timeout);
        }
    };
}

export const SelectSearchComponent = {
    //the dropdown appears when the user types in the search bar
    template: `
      <div class="space-y-1.5">
        <div class="text-lg text-white font-semibold">Pick any song or artist</div>
        <div v-if="searchData===undefined"></div>
        <div v-else class=" w-full">
          <input type="text"
                 v-model="searchTerm"
                 :placeholder="placeholder"
                 @blur="exit()"
                 @focus="showOptions()"
                 @input="handleDebouncedInput"
                 class="object-fill w-full p-2 rounded">
          <div class="dropdown-content"
               v-show="optionsShown">
            <div v-if="searchTerm.length > 0" v-for="item in filteredDataSongs" :key="item.isSong? item.id:item.artist"
                 @mousedown="optionClicked(item)"
                 class="dropdown-item">
              <div>
                (Song) {{ Array.from(item.artist).join(', ') }} - {{ item.track }}
              </div>
            </div>
            <div v-if="searchTerm.length > 0" v-for="item in filteredDataArtists" :key="item.isSong? item.id:item.artist"
                 @mousedown="optionClicked(item)"
                 class="dropdown-item">
              <div>
                (Artist) {{ item.artist }}
              </div>
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
        },
        replace: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            selected: {},
            searchTerm: "",
            filteredData: [],
            optionsShown: false,
            clear: false
        }
    },
    computed: {
        //filter the data based on the search term, searches songs or artists
        filteredDataSongs() {
            return this.filteredData.filter(item => item.isSong)
        },
        filteredDataArtists() {
            return this.filteredData.filter(item => !item.isSong)
        }
    },
    methods: {
        //compute the filtered data
        computeFilteredData() {
            const filtered = [];
            const regOption = new RegExp(this.searchTerm, 'ig');
            for (const option of this.searchData) {
                if (this.searchTerm.length < 1 || option.isSong ? (option?.track + Array.from(option?.artist).join(' ')).match(regOption) : option.artist?.match(regOption)) {
                    filtered.push(option);
                }
            }
            this.filteredData = filtered
        },
        //when an option is clicked, set the selected option and emit the selected option
        optionClicked(item) {
            this.selected = {
                isSong: item.isSong,
                idOrArtist: item.isSong ? item.id : item.artist
            }
            this.searchTerm = item.isSong ? item.track : item.artist
            this.optionsShown = false;
            // calls the function to change other components on the page
            optionChanged(item.isSong, item.isSong ? item.id : item.artist)
            // emits the option to change components on the comparison card
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
            this.computeFilteredData()
            this.optionsShown = true;
        }, 100, true),
        replaceSearch() {
            if (this.replace) {
                this.searchTerm = this.replace.searchTerm;
                this.replace = false;
            }
        }
    },
    //watch for the replace prop to change, and replace the search term with the new search term
    //this is used when the user clicks on a song or artist in the bar chart
    watch: {
        replace: {
            handler: 'replaceSearch'
        }
    }
}