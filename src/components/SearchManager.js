import { mapConfig } from '../config/mapConfig.js'
import { mapboxgl } from '../utils/mapboxgl.js'

export class SearchManager {
  constructor(map) {
    this.map = map
    this.searchBox = null
    this.customSuggestions = [
      {
        name: 'Khomasdal',
        coordinates: [17.0469176743274, -22.54520317814792],
        place_type: ['neighborhood'],
        place_name: 'Khomasdal, Windhoek, Namibia',
      },
      {
        name: 'Katutura',
        coordinates: [17.05041064852741, -22.520378030509132],
        place_type: ['neighborhood'],
        place_name: 'Katutura, Windhoek, Namibia',
      },
      {
        name: 'Suiderhof',
        coordinates: [17.09256469161655, -22.601199158359044],
        place_type: ['neighborhood'],
        place_name: 'Suiderhof, Windhoek, Namibia',
      },
      {
        name: 'Elisenheim',
        coordinates: [17.08129531310496, -22.50958262249567],
        place_type: ['neighborhood'],
        place_name: 'Elisenheim, Windhoek, Namibia',
      },
      {
        name: 'Windhoek West',
        coordinates: [17.074678455945417, -22.562507321165512],
        place_type: ['neighborhood'],
        place_name: 'Windhoek West, Windhoek, Namibia',
      },
      {
        name: 'Klein Windhoek',
        coordinates: [17.097251926129626, -22.571305048553636],
        place_type: ['neighborhood'],
        place_name: 'Klein Windhoek, Windhoek, Namibia',
      },
      {
        name: 'Southern Industrial Area',
        coordinates: [17.07989317043607, -22.58497349355685],
        place_type: ['neighborhood'],
        place_name: 'Southern Industrial Area, Windhoek, Namibia',
      },
      {
        name: 'Windhoek Central',
        coordinates: [17.080475533746686, -22.573475211818067],
        place_type: ['neighborhood'],
        place_name: 'Windhoek Central, Windhoek, Namibia',
      },
      {
        name: 'Eros',
        coordinates: [17.092279160163002, -22.54941850015299],
        place_type: ['neighborhood'],
        place_name: 'Eros, Windhoek, Namibia',
      },
    ]
  }

  initialize() {
    // Wait for the search script to load before initializing search
    const searchScript = document.getElementById('search-js')
    if (searchScript) {
      searchScript.addEventListener('load', () => {
        this.initializeSearch()
      })
      // If the script is already loaded, initialize search immediately
      if (window.mapboxsearch) {
        this.initializeSearch()
      }
    } else {
      console.error('Search script not found in the DOM')
    }
  }

  initializeSearch() {
    try {
      if (!window.mapboxsearch) {
        throw new Error('Mapbox search not available')
      }

      this.searchBox = new window.mapboxsearch.MapboxSearchBox()
      this.searchBox.accessToken = mapConfig.accessToken

      // Configure search box options
      this.searchBox.options = {
        language: 'en',
        country: 'NA',
        types: ['neighborhood'],
        limit: 1,
        showResultsWhileTyping: true,
        minLength: 1,
        enableGeolocation: false,
        geocoder: {
          enabled: false,
        },
      }

      this.setupSearchBox()
      this.setupSuggestions()
      this.bindSearchBox()
    } catch (error) {
      console.error('Error initializing search:', error)
      this.showSearchError()
    }
  }

  setupSearchBox() {
    this.searchBox.mapboxgl = mapboxgl
    this.searchBox.marker = false
    this.searchBox.flyTo = false

    // Prevent default form submission
    this.searchBox.addEventListener('submit', (e) => {
      e.preventDefault()
      return false
    })
  }

  setupSuggestions() {
    const container = document.getElementById('search-box-container')
    if (!container) {
      throw new Error('Search box container not found')
    }

    // Create suggestions container
    const suggestionsContainer = document.createElement('div')
    suggestionsContainer.className = 'mapboxgl-ctrl-geocoder--suggestions'
    container.appendChild(suggestionsContainer)
    container.appendChild(this.searchBox)

    this.setupSuggestionsUI(container, suggestionsContainer)
    this.setupSuggestionsStyles()
  }

  setupSuggestionsUI(container, suggestionsContainer) {
    // Function to update suggestions UI
    const updateSuggestionsUI = (suggestions) => {
      if (suggestions.length > 0) {
        suggestionsContainer.innerHTML = suggestions
          .map(
            (result) => `
            <div class="mapboxgl-ctrl-geocoder--suggestion" data-location='${JSON.stringify(
              result
            )}'>
              <div class="mapboxgl-ctrl-geocoder--suggestion-name">${
                result.place_name
              }</div>
            </div>
          `
          )
          .join('')

        // Add click handlers to suggestions
        suggestionsContainer
          .querySelectorAll('.mapboxgl-ctrl-geocoder--suggestion')
          .forEach((element) => {
            element.addEventListener('click', () => {
              const locationData = JSON.parse(element.dataset.location)
              const coordinates = locationData.coordinates

              if (coordinates) {
                this.searchBox.value = locationData.place_name
                this.map.flyTo({
                  center: coordinates,
                  zoom: 15,
                  essential: true,
                  duration: 2000,
                })
              }
              suggestionsContainer.innerHTML = ''
              suggestionsContainer.style.display = 'none'
            })
          })

        suggestionsContainer.style.display = 'block'
      } else {
        suggestionsContainer.style.display = 'none'
      }
    }

    // Listen for input events to handle suggestions
    this.searchBox.addEventListener('input', (event) => {
      const query = event.target.value?.toLowerCase() || ''

      if (query.length > 0) {
        const customMatches = this.customSuggestions
          .filter((suggestion) => suggestion.name.toLowerCase().includes(query))
          .map((match) => ({
            type: 'Feature',
            id: match.name,
            place_type: match.place_type,
            place_name: match.place_name,
            properties: {
              name: match.name,
            },
            text: match.name,
            coordinates: match.coordinates,
            geometry: {
              type: 'Point',
              coordinates: match.coordinates,
            },
          }))

        updateSuggestionsUI(customMatches)
      } else {
        suggestionsContainer.style.display = 'none'
      }
    })
  }

  setupSuggestionsStyles() {
    const style = document.createElement('style')
    style.textContent = `
      .mapboxgl-ctrl-geocoder--suggestions {
        display: none;
        position: absolute;
        left: auto;
        top: auto;
        right: auto;
        bottom: auto;
        z-index: 1000;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.0);
        width: 98%;
        max-height: 200px;
        overflow-y: auto;
        margin: 48px 0px 0px  0px;
      }
      .mapboxgl-ctrl-geocoder--suggestion {
        padding: 5px;
        cursor: pointer;
        border-bottom: 1px solid #e8e8e8;
      }
      .mapboxgl-ctrl-geocoder--suggestion:last-child {
        border-bottom: none;
      }
      .mapboxgl-ctrl-geocoder--suggestion:hover {
        background: #f5f5f5;
      }
      .mapboxgl-ctrl-geocoder--suggestion-name {
        font-size: 14px;
        color: #404040;
      }
    `
    document.head.appendChild(style)
  }

  bindSearchBox() {
    this.searchBox.bindMap(this.map)
  }

  showSearchError() {
    const container = document.getElementById('search-box-container')
    if (container) {
      container.innerHTML = `<div style="padding: 10px; color: red;">Error loading search. Please refresh the page.</div>`
    }
  }
}
