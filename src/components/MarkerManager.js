import { mapConfig } from '../config/mapConfig.js'
import { DOM, ACTIVE_CLASS } from '../config/selectors.js'
import { LocationService } from '../services/LocationService.js'
import { mapboxgl } from '../utils/mapboxgl.js'

/**
 * MarkerManager – Creates and manages Mapbox GL markers.
 */
export class MarkerManager {
  constructor(map) {
    this.map = map
    this.markers = []
    this.mapLocations = { type: 'FeatureCollection', features: [] }
  }

  /** Load GeoJSON data from the DOM. */
  loadLocationData() {
    this.mapLocations = LocationService.getGeoData()
    return this.mapLocations
  }

  /** Add a red marker for the user's geolocation. */
  addUserLocationMarker(userLocation) {
    if (userLocation.isDefault) return

    const marker = new mapboxgl.Marker({ color: mapConfig.markerColors.user })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(this.map)

    this.markers.push({
      type: 'user',
      marker,
      coordinates: [userLocation.lng, userLocation.lat],
    })
  }

  /** Create markers for every location feature. */
  addMapPoints() {
    this.clearMapPoints()
    this.mapLocations.features.forEach((feature, index) => {
      this.createLocationMarker(feature, index)
    })
  }

  /**
   * Create a single Mapbox marker for a location feature.
   * Reads the icon from the sidebar CMS item at the same index.
   */
  createLocationMarker(feature, index) {
    // Resolve icon from the sidebar DOM
    const sidebarItems = document.querySelectorAll(DOM.SIDEBAR_ITEMS)
    const sidebarItem = sidebarItems[index]
    const iconImg = sidebarItem?.querySelector(DOM.MARKER_ICON)
    const iconUrl =
      iconImg?.src ||
      'https://cdn.prod.website-files.com/685aa028e93063a272e237d3/68d25e1b82100a3a09d5d8cd_map-pin-food.svg'

    if (iconUrl.includes('placeholder.60f9b1840c.svg')) return

    // Build marker element
    const el = document.createElement('div')
    el.className = 'markericon'
    el.style.backgroundImage = `url("${iconUrl}")`
    el.style.cursor = 'pointer'

    const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(feature.geometry.coordinates)
      .addTo(this.map)

    this.markers.push({ type: 'location', marker, feature, index })

    // Click → dispatch markerClick with locationId
    el.addEventListener('click', (e) => {
      e.stopPropagation()

      document.dispatchEvent(
        new CustomEvent('markerClick', {
          detail: {
            features: [
              {
                geometry: { coordinates: feature.geometry.coordinates },
                properties: feature.properties,
              },
            ],
            lngLat: {
              lng: feature.geometry.coordinates[0],
              lat: feature.geometry.coordinates[1],
            },
          },
        })
      )
    })

    // Cursor style on hover
    el.addEventListener('mouseenter', () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })
    el.addEventListener('mouseleave', () => {
      this.map.getCanvas().style.cursor = ''
    })
  }

  // ── Cleanup ────────────────────────────────────────────────

  clearMapPoints() {
    const layerId = mapConfig.layerSettings.id
    if (this.map.getLayer(layerId)) this.map.removeLayer(layerId)
    if (this.map.getSource(layerId)) this.map.removeSource(layerId)

    this.markers
      .filter((m) => m.type === 'location')
      .forEach((m) => m.marker.remove())
    this.markers = this.markers.filter((m) => m.type === 'user')
  }

  clearAllMarkers() {
    this.markers.forEach((m) => m.marker.remove())
    this.markers = []
  }

  // ── Accessors ──────────────────────────────────────────────

  getLocationMarkers() {
    return this.markers.filter((m) => m.type === 'location')
  }
  getUserMarkers() {
    return this.markers.filter((m) => m.type === 'user')
  }
  getMapLocations() {
    return this.mapLocations
  }

  /** Kept for backward-compat; hover setup is done in createLocationMarker. */
  setupHoverEvents() {}
}
