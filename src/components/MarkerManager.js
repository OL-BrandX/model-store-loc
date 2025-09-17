import { mapConfig } from '../config/mapConfig.js'
import { LocationService } from '../services/LocationService.js'
import { mapboxgl } from '../utils/mapboxgl.js'

export class MarkerManager {
  constructor(map) {
    this.map = map
    this.markers = []
    this.popup = null
    this.mapLocations = {
      type: 'FeatureCollection',
      features: [],
    }
    this.isClickInProgress = false
    this.initializePopup()
  }

  initializePopup() {
    // Popup functionality is disabled
    this.popup = null
  }

  loadLocationData() {
    this.mapLocations = LocationService.getGeoData()
    return this.mapLocations
  }

  addUserLocationMarker(userLocation) {
    if (!userLocation.isDefault) {
      const userMarker = new mapboxgl.Marker({
        color: mapConfig.markerColors.user,
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(this.map)

      this.markers.push({
        type: 'user',
        marker: userMarker,
        coordinates: [userLocation.lng, userLocation.lat],
      })
    }
  }

  addMapPoints() {
    // Remove existing layer and source if they exist
    this.clearMapPoints()

    // Create markers for each location
    this.mapLocations.features.forEach((location, index) => {
      this.createLocationMarker(location, index)
    })
  }

  createLocationMarker(location, index) {
    // Get the icon URL from the location list
    const locationNode = document.querySelectorAll('#location-list > *')[index]
    const iconImg = locationNode?.querySelector('.markericon img')
    const iconUrl =
      iconImg?.src ||
      'https://cdn.prod.website-files.com/678d364888a0aa90f5f49e2c/678fb0a891ae9c935315e936_kitchen-utensils.svg'

    // Skip placeholder icons
    if (iconUrl.includes('placeholder.60f9b1840c.svg')) {
      return
    }

    // Create marker element
    const el = document.createElement('div')
    el.className = 'markericon'
    el.style.backgroundImage = `url("${iconUrl}")`
    el.style.cursor = 'pointer'

    // Create and add the marker to the map
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(location.geometry.coordinates)
      .addTo(this.map)

    // Store marker reference
    this.markers.push({
      type: 'location',
      marker: marker,
      location: location,
      index: index,
    })

    // Add click event listener to the marker
    marker.getElement().addEventListener('click', () => {
      // Hide any existing popup and prevent hover popups during click
      this.hidePopup()
      this.isClickInProgress = true

      const clickEvent = {
        features: [
          {
            geometry: {
              coordinates: location.geometry.coordinates,
            },
            properties: location.properties,
          },
        ],
        lngLat: {
          lng: location.geometry.coordinates[0],
          lat: location.geometry.coordinates[1],
        },
      }
      this.handleMarkerClick(clickEvent)

      // Reset click flag after a short delay
      setTimeout(() => {
        this.isClickInProgress = false
      }, 100)
    })

    // Add hover event listeners directly during marker creation
    const markerElement = marker.getElement()

    if (!markerElement) {
      return
    }

    markerElement.addEventListener('mouseenter', () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })

    markerElement.addEventListener('mouseleave', () => {
      this.map.getCanvas().style.cursor = ''
    })
  }

  handleMarkerClick(e) {
    // Emit a custom event that MapManager can listen to
    const customEvent = new CustomEvent('markerClick', {
      detail: e,
    })
    document.dispatchEvent(customEvent)
  }

  showPopup(e) {
    // Popup display is disabled - no popups will be shown
    return
  }

  hidePopup() {
    // Popup functionality is disabled
    if (this.popup) {
      this.popup.remove()
    }
  }

  clearMapPoints() {
    const layerId = mapConfig.layerSettings.id

    // Remove existing layer and source if they exist
    if (this.map.getLayer(layerId)) {
      this.map.removeLayer(layerId)
    }
    if (this.map.getSource(layerId)) {
      this.map.removeSource(layerId)
    }

    // Remove all location markers
    this.markers
      .filter((m) => m.type === 'location')
      .forEach((m) => m.marker.remove())

    // Keep only user markers
    this.markers = this.markers.filter((m) => m.type === 'user')
  }

  clearAllMarkers() {
    this.markers.forEach((m) => m.marker.remove())
    this.markers = []
    this.hidePopup()
  }

  getLocationMarkers() {
    return this.markers.filter((m) => m.type === 'location')
  }

  getUserMarkers() {
    return this.markers.filter((m) => m.type === 'user')
  }

  getMapLocations() {
    return this.mapLocations
  }

  // Setup event listeners for hover effects
  setupHoverEvents() {
    // Hover events are now set up directly during marker creation
    // This method is kept for backward compatibility but does nothing
  }
}
