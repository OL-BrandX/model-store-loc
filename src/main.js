import { initializeFilters } from '../filters.js'
import { initializeListingManager } from '../ListingManager.js'
import { MapManager } from './components/MapManager.js'
import 'mapbox-gl-style-switcher/styles.css'


function waitForWebflow(callback) {
  if (window.Webflow && window.Webflow.push) {
    window.Webflow.push(callback)
  } else {
    setTimeout(() => waitForWebflow(callback), 100)
  }
}

// Ensure both DOM and Webflow are ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    waitForWebflow(() => {
      initializeApp()
    })
  })
} else {
  waitForWebflow(() => {
    initializeApp()
  })
}

function initializeApp() {
  try {
    // Initialize MapManager only if we're on a page with a map
    const mapContainer = document.getElementById('map')
    if (mapContainer) {
      new MapManager()
    }

    // Initialize filtering functionality
    initializeFilters()
  } catch (error) {
    // Silent error handling
  }
  // Initialize ListingManager
  try {
    initializeListingManager()
  } catch (error) {
    // Silent error handling
  }
}
