import { MapboxStyleSwitcherControl } from 'mapbox-gl-style-switcher'

import { MapStyleManager } from './MapStyleManager.js'
import { MarkerManager } from './MarkerManager.js'
import { mapConfig } from '../config/mapConfig.js'
import { DOM, ACTIVE_CLASS, WF_STYLE_OVERRIDES } from '../config/selectors.js'
import { LocationService } from '../services/LocationService.js'
import { UIService } from '../services/UIService.js'
import { mapboxgl } from '../utils/mapboxgl.js'
import 'mapbox-gl-style-switcher/styles.css'

/**
 * MapManager – Coordinates all map-related functionality.
 * Acts as a facade for MarkerManager, MapStyleManager, and UIService.
 */
export class MapManager {
  constructor() {
    this.map = null
    this.userLocation = null
    this.markerManager = null
    this.styleManager = null
    this.searchBox = null

    // Throttle for zoom hint toast
    this.lastZoomHintTime = 0
    this.zoomHintCooldown = 3000

    this.initializeMap()
  }

  // ── Initialization ────────────────────────────────────────

  initializeMap() {
    mapboxgl.accessToken = mapConfig.accessToken

    const container = document.querySelector(DOM.MAP_CONTAINER)
    if (!container) throw new Error('Map container #map not found')

    this.ensureContainerDimensions(container)

    try {
      container.innerHTML = ''
      this.map = new mapboxgl.Map(mapConfig.defaultMapSettings)
      this.initializeManagers()
      this.setupMapControls()
      this.setupEventListeners()
    } catch (error) {
      throw error
    }
  }

  ensureContainerDimensions(el) {
    if (el.offsetWidth === 0 || el.offsetHeight === 0) {
      el.style.width = '100%'
      el.style.height = '100vh'
    }
  }

  initializeManagers() {
    this.markerManager = new MarkerManager(this.map)
    this.styleManager = new MapStyleManager(this.map)
    this.styleManager.applyCustomStyling()
    this.initializeSearchBox()
  }

  // ── Controls ──────────────────────────────────────────────

  setupMapControls() {
    UIService.setMapInstance(this.map)

    this.map.addControl(new mapboxgl.NavigationControl())
    this.map.addControl(new mapboxgl.FullscreenControl())
    this.map.addControl(new MapboxStyleSwitcherControl())

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    })
    this.map.addControl(geolocate)
  }

  // ── Event Listeners ───────────────────────────────────────

  setupEventListeners() {
    this.map.on('load', () => this.initializeUserLocation())
    this.map.on('error', () => {})

    // Central markerClick handler (from markers AND sidebar clicks)
    document.addEventListener('markerClick', (e) => {
      this.handleLocationClick(e.detail)
    })

    // Ctrl+scroll to zoom
    this.map.on('wheel', (event) => {
      const oe = event.originalEvent
      if (oe.ctrlKey || oe.metaKey || oe.altKey) {
        this.map.scrollZoom.enable()
      } else {
        this.map.scrollZoom.disable()
        this.showZoomHint()
      }
    })

    // Setup UI event listeners (sidebar clicks, close buttons)
    UIService.setupEventListeners()
  }

  // ── User Location ─────────────────────────────────────────

  async initializeUserLocation() {
    try {
      this.userLocation = await LocationService.getUserLocation()
      this.markerManager.loadLocationData()
      this.flyToLocation()
      this.markerManager.addUserLocationMarker(this.userLocation)
      this.markerManager.addMapPoints()
      this.markerManager.setupHoverEvents()
    } catch {
      this.markerManager.loadLocationData()
      this.markerManager.addMapPoints()
      this.markerManager.setupHoverEvents()
      this.styleManager.setupCountryZoom()
    }
  }

  flyToLocation() {
    this.map.flyTo({
      center: [this.userLocation.lng, this.userLocation.lat],
      zoom: this.userLocation.isDefault ? 13 : 16,
      essential: true,
      duration: 2000,
    })
  }

  // ── Location Click Handler ────────────────────────────────

  handleLocationClick(e) {
    const { coordinates } = e.features[0].geometry
    const { locationId }  = e.features[0].properties

    // Activate the card in both sidebar and map panel
    this.activateLocation(locationId)

    // Fly the map to the marker
    try {
      this.map.flyTo({
        center: coordinates,
        zoom: 16,
        speed: 1.2,
        curve: 1.42,
        duration: 2000,
      })
    } catch (err) {
      console.error('flyTo error:', err)
    }
  }

  // ── UI Activation ─────────────────────────────────────────

  /**
   * Activate a specific location in both the sidebar and the map panel.
   *
   * @param {string} locationId  – The value of the hidden `#locationID`
   *                               input (e.g. "auas-valley").
   */
  activateLocation(locationId) {
    if (!locationId) return

    // 1. Deactivate everything first
    UIService.deactivateAll()

    // 2. Show the map-panel list container
    const mapList = document.querySelector(DOM.MAP_PANEL_LIST)
    if (mapList) mapList.classList.add('active')

    // Use a small delay so the deactivation paint completes
    // and Webflow IX2 doesn't fight our changes
    setTimeout(() => {
      // 3. Activate sidebar item
      this.activateItemByLocationId(DOM.SIDEBAR_ITEMS, locationId)

      // 4. Activate map-panel item
      this.activateItemByLocationId(DOM.MAP_PANEL_ITEMS, locationId)
    }, 60)
  }

  /**
   * Find an item within `containerSelector` that contains a hidden
   * `#locationID` input matching `locationId`, then add `is--show`
   * to both the item and its child `.location-map_card-wrap`.
   */
  activateItemByLocationId(containerSelector, locationId) {
    const items = document.querySelectorAll(containerSelector)

    for (const item of items) {
      const idInput = item.querySelector(DOM.LOCATION_ID)
      if (!idInput || idInput.value !== locationId) continue

      // Activate the list-item wrapper (.w-dyn-item / .locations-map_item)
      item.classList.add(ACTIVE_CLASS)

      // Override Webflow interaction styles that may hide the item
      WF_STYLE_OVERRIDES.forEach((prop) => {
        item.style.setProperty(prop, 'none', 'important')
      })

      // Activate the card-wrap inside
      const cardWrap = item.querySelector(DOM.CARD_WRAP)
      if (cardWrap) {
        cardWrap.classList.add(ACTIVE_CLASS)
      }

      break // only one match per list
    }
  }

  // ── Zoom Hint Toast ───────────────────────────────────────

  showZoomHint() {
    const now = Date.now()
    if (now - this.lastZoomHintTime < this.zoomHintCooldown) return
    this.lastZoomHintTime = now

    let container = document.getElementById('zoom-toast-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'zoom-toast-container'
      container.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        z-index: 1000; pointer-events: none;
      `
      document.body.appendChild(container)
    }
    container.innerHTML = ''

    const toast = document.createElement('div')
    toast.style.cssText = `
      background: rgba(0,0,0,.8); color: #fff; padding: 12px 20px;
      border-radius: 6px; font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,.15); opacity: 0;
      transform: translateY(-10px); transition: all .3s ease;
    `
    toast.textContent = 'Use Ctrl + Scroll to zoom the map'
    container.appendChild(toast)

    requestAnimationFrame(() => {
      toast.style.opacity = '1'
      toast.style.transform = 'translateY(0)'
    })

    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateY(-10px)'
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

  // ── Search Box ────────────────────────────────────────────

  initializeSearchBox() {
    const searchScript = document.getElementById('search-js')
    if (!searchScript) return

    searchScript.addEventListener('load', () => this.setupSearchBox())
    if (window.mapboxsearch) this.setupSearchBox()
  }

  setupSearchBox() {
    try {
      if (!window.mapboxsearch) return

      this.searchBox = document.createElement('mapbox-search-box')
      this.searchBox.accessToken = mapConfig.accessToken
      this.searchBox.options = {
        language: 'en',
        country: 'NA',
        proximity: [17.080, -22.570],
        limit: 5,
      }
      this.searchBox.mapboxgl = mapboxgl
      this.searchBox.marker = true
      this.searchBox.flyTo = true
      this.searchBox.bindMap(this.map)
      this.map.addControl(this.searchBox, 'top-right')
    } catch (err) {
      console.error('Search box error:', err)
    }
  }

  // ── Public API ────────────────────────────────────────────

  getSearchBox()     { return this.searchBox }
  getMarkerManager() { return this.markerManager }
  getStyleManager()  { return this.styleManager }
  getMap()           { return this.map }
  getUserLocation()  { return this.userLocation }

  clearMarkers() { this.markerManager.clearAllMarkers() }
  resetMap()     { this.clearMarkers(); this.styleManager.resetStyling() }
}
