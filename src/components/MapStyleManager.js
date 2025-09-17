import { mapboxgl } from '../utils/mapboxgl.js'

export class MapStyleManager {
  constructor(map) {
    this.map = map
  }

  // Helper method to safely check if a layer exists
  layerExists(layerId) {
    return this.map.getLayer(layerId) !== undefined
  }

  // Helper method to safely set paint properties
  safePaintProperty(layerId, property, value) {
    if (this.layerExists(layerId)) {
      this.map.setPaintProperty(layerId, property, value)
      return true
    }
    return false
  }

  // Helper method to safely set layout properties
  safeLayoutProperty(layerId, property, value) {
    if (this.layerExists(layerId)) {
      this.map.setLayoutProperty(layerId, property, value)
      return true
    }
    return false
  }

  applyCustomStyling() {
    // Use the proper Mapbox GL JS event for style modifications
    this.map.on('style.load', () => {
      // Only apply minimal modifications to preserve custom style integrity

      // Optional: Only hide specific POI labels if needed
      // this.hideUnwantedLabels()

      // Don't modify background, lighting, or add overlays for custom styles
      // This preserves the original style design
    })
  }

  hideUnwantedLabels() {
    // Hide only POI and transit labels, keep place labels
    const layers = this.map.getStyle().layers

    for (const layer of layers) {
      if (layer.type === 'symbol') {
        // Only hide POI and transit labels
        if (layer.id.includes('poi') || layer.id.includes('transit')) {
          this.safeLayoutProperty(layer.id, 'visibility', 'none')
        }
      }
    }
  }

  applyFadedTheme() {
    // Apply faded theme by adjusting opacity and saturation
    // Check if background layer exists before styling it
    if (this.map.getLayer('background')) {
      this.map.setPaintProperty('background', 'background-opacity', 0.8)
    } else {
      // Add a background layer if it doesn't exist
      this.map.addLayer(
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#f8f8f8',
            'background-opacity': 0.8,
          },
        },
        this.map.getStyle().layers[0]?.id
      ) // Add as the first layer
    }
  }

  ensureVisibleElements() {
    // Ensure pedestrian paths and trails are visible
    const visibleElements = [
      'pedestrian',
      'path',
      'trail',
      'road-label',
      'transit',
      'poi',
      'place',
    ]

    visibleElements.forEach((elementId) => {
      // Use the safe layout property helper method
      this.safeLayoutProperty(elementId, 'visibility', 'visible')
    })
  }

  setLighting() {
    // Set light preset to Day
    this.map.setLight({
      anchor: 'viewport',
      color: 'white',
      intensity: 0.4,
      position: [1.15, 210, 30],
    })
  }

  addFadeOverlay() {
    // Add a semi-transparent overlay to create faded effect
    if (!this.layerExists('fade-overlay')) {
      try {
        this.map.addLayer({
          id: 'fade-overlay',
          type: 'background',
          paint: {
            'background-color': '#ffffff',
            'background-opacity': 0.2,
          },
        })
      } catch (error) {
        // Failed to add fade overlay
      }
    }
  }

  setupCountryZoom(countryCode = 'NA') {
    // Add a source for country boundaries
    this.map.addSource('country-boundaries', {
      type: 'vector',
      url: 'mapbox://mapbox.country-boundaries-v1',
      promoteId: 'iso_3166_1',
    })

    // Add a layer for country boundaries
    this.map.addLayer({
      id: 'country-boundaries',
      type: 'fill',
      source: 'country-boundaries',
      'source-layer': 'country_boundaries',
      paint: {
        'fill-opacity': 0,
      },
      filter: ['==', ['get', 'iso_3166_1'], countryCode],
    })

    const bounds = new mapboxgl.LngLatBounds()
    const handleSourceData = (e) => {
      if (
        e.sourceId !== 'country-boundaries' ||
        !this.map.isSourceLoaded('country-boundaries')
      ) {
        return
      }

      // Get features from the source
      const features = this.map.querySourceFeatures('country-boundaries', {
        sourceLayer: 'country_boundaries',
      })

      if (features.length > 0) {
        features.forEach((feature) => {
          if (feature.geometry && feature.geometry.coordinates) {
            feature.geometry.coordinates.forEach((ring) => {
              ring.forEach((coord) => {
                bounds.extend(coord)
              })
            })
          }
        })

        // Fit the map to the bounds
        this.map.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          duration: 1000,
          maxZoom: 12,
        })

        this.map.off('sourcedata', handleSourceData)
      }
    }

    this.map.on('sourcedata', handleSourceData)
  }

  resetStyling() {
    // Remove custom overlays and reset to default styling
    if (this.layerExists('fade-overlay')) {
      this.map.removeLayer('fade-overlay')
    }

    if (this.layerExists('country-boundaries')) {
      this.map.removeLayer('country-boundaries')
    }

    if (this.map.getSource('country-boundaries')) {
      this.map.removeSource('country-boundaries')
    }
  }
}
