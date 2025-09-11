import { MapboxStyleSwitcherControl } from 'mapbox-gl-style-switcher'

import { MapStyleManager } from './MapStyleManager.js'
import { MarkerManager } from './MarkerManager.js'
import { SearchManager } from './SearchManager.js'
import { mapConfig } from '../config/mapConfig.js'
import { LocationService } from '../services/LocationService.js'
import { UIService } from '../services/UIService.js'
import { mapboxgl } from '../utils/mapboxgl.js'

/**
 * MapManager - Coordinates all map-related functionality
 * Now acts as a facade/coordinator for specialized managers
 */
export class MapManager {
  constructor() {
    this.map = null
    this.userLocation = null

    // Initialize specialized managers
    this.searchManager = null
    this.markerManager = null
    this.styleManager = null

    this.initializeMap()
  }

  /**
   * Initialize the main map instance and setup managers
   */
  initializeMap() {
    // Set Mapbox access token
    mapboxgl.accessToken = mapConfig.accessToken

    // Validate map container
    const mapContainer = document.getElementById('map')
    if (!mapContainer) {
      throw new Error('Map container #map not found in the DOM')
    }

    // Ensure container has dimensions
    this.ensureContainerDimensions(mapContainer)

    try {
      // Create map instance
      this.map = new mapboxgl.Map(mapConfig.defaultMapSettings)

      // Initialize specialized managers
      this.initializeManagers()

      // Setup map controls and UI
      this.setupMapControls()

      // Setup event listeners
      this.setupEventListeners()
    } catch (error) {
      console.error('Error initializing map:', error)
      throw error
    }
  }

  /**
   * Ensure map container has proper dimensions
   */
  ensureContainerDimensions(container) {
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      container.style.width = '100%'
      container.style.height = '100vh'
    }
  }

  /**
   * Initialize all specialized managers
   */
  initializeManagers() {
    this.searchManager = new SearchManager(this.map)
    this.markerManager = new MarkerManager(this.map)
    this.styleManager = new MapStyleManager(this.map)

    // Apply custom styling
    this.styleManager.applyCustomStyling()

    // Initialize search functionality
    this.searchManager.initialize()
  }

  /**
   * Setup map controls (navigation, geolocation, fullscreen)
   */
  setupMapControls() {
    // Share map instance with UIService
    UIService.setMapInstance(this.map)

    // Add navigation controls
    this.map.addControl(new mapboxgl.NavigationControl())

    // Add fullscreen control
    this.map.addControl(new mapboxgl.FullscreenControl())

    // Add styleSwitcher control
    this.map.addControl(new MapboxStyleSwitcherControl())

    // Add geolocation control
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    })
    this.map.addControl(geolocateControl)
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Wait for map to load before setting up location-based features
    this.map.on('load', () => {
      this.initializeUserLocation()
    })

    // Listen for marker clicks
    document.addEventListener('markerClick', (e) => {
      this.handleLocationClick(e.detail)
    })

    // Setup UI event listeners
    UIService.setupEventListeners()
  }

  /**
   * Initialize user location and map points
   */
  async initializeUserLocation() {
    try {
      // Get user location
      this.userLocation = await LocationService.getUserLocation()

      // Load and display map locations
      this.markerManager.loadLocationData()

      // Fly to user location or default
      this.flyToLocation()

      // Add user location marker
      this.markerManager.addUserLocationMarker(this.userLocation)

      // Add map points
      this.markerManager.addMapPoints()

      // Setup hover events for markers
      this.markerManager.setupHoverEvents()
    } catch (error) {
      console.warn('Error in initializeUserLocation:', error)

      // Fallback: load map locations and setup country zoom
      this.markerManager.loadLocationData()
      this.markerManager.addMapPoints()
      this.markerManager.setupHoverEvents()
      this.styleManager.setupCountryZoom()
    }
  }

  /**
   * Fly to user location or default location
   */
  flyToLocation() {
    this.map.flyTo({
      center: [this.userLocation.lng, this.userLocation.lat],
      zoom: this.userLocation.isDefault ? 13 : 16,
      essential: true,
      duration: 2000,
    })
  }

  /**
   * Handle location/marker click events
   */
  async handleLocationClick(e) {
    const ID = e.features[0].properties.arrayID

    // Show popup
    this.markerManager.showPopup(e)

    // Update UI
    this.updateLocationUI(ID)

    // Ease to location
    this.map.easeTo({
      center: e.features[0].geometry.coordinates,
      speed: 0.5,
      curve: 1,
      duration: 1000,
    })
  }

  /**
   * Update UI elements when a location is selected
   */
  updateLocationUI(locationID) {
    // Show location list
    const locationList = document.getElementById('location-list')
    if (locationList) {
      locationList.classList.add('active')
    }

    // Show map wrapper
    const mapWrapper = document.querySelector('.locations-map_wrapper')
    if (mapWrapper) {
      mapWrapper.classList.add('is--show')
    }

    // Remove highlight from all items and highlight the selected one
    document
      .querySelectorAll('.locations-map_item.is--show')
      .forEach((item) => item.classList.remove('is--show'))

    const locationItems = document.querySelectorAll('.locations-map_item')
    if (locationItems[locationID]) {
      locationItems[locationID].classList.add('is--show')
    }
  }

  /**
   * Public API methods for external access
   */

  // Get managers
  getSearchManager() {
    return this.searchManager
  }

  getMarkerManager() {
    return this.markerManager
  }

  getStyleManager() {
    return this.styleManager
  }

  // Get map instance
  getMap() {
    return this.map
  }

  // Get user location
  getUserLocation() {
    return this.userLocation
  }

  // Cleanup methods

  clearMarkers() {
    this.markerManager.clearAllMarkers()
  }

  resetMap() {
    this.clearMarkers()
    this.styleManager.resetStyling()
  }
}
