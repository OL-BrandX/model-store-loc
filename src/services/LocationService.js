import { DOM, ACTIVE_CLASS, WF_STYLE_OVERRIDES } from '../config/selectors.js'

/**
 * LocationService – Extracts geo-data from the Webflow CMS list.
 *
 * Uses the SIDEBAR list as the canonical data source because it is the
 * list wired to the search / filter UI (fs-cmsfilter).
 */
export class LocationService {
  /**
   * Attempt to get the user's current position; falls back to Windhoek.
   * @returns {Promise<{lng: number, lat: number, isDefault: boolean}>}
   */
  static async getUserLocation() {
    const defaultLocation = {
      lng: 17.080475533746686,
      lat: -22.573475211818067,
      isDefault: true,
    }

    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) return resolve(defaultLocation)

      const timeoutId = setTimeout(() => resolve(defaultLocation), 5000)

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeoutId)
          resolve({ lng: pos.coords.longitude, lat: pos.coords.latitude, isDefault: false })
        },
        () => {
          clearTimeout(timeoutId)
          resolve(defaultLocation)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    })
  }

  /**
   * Build a GeoJSON FeatureCollection from the sidebar CMS items.
   *
   * Each feature carries `properties.locationId` which is the value of
   * the hidden `#locationID` input (e.g. "auas-valley"). This is the
   * primary key used throughout the app.
   *
   * @returns {{ type: string, features: Array }}
   */
  static getGeoData() {
    const items = document.querySelectorAll(DOM.SIDEBAR_ITEMS)

    return {
      type: 'FeatureCollection',
      features: Array.from(items)
        .map((item) => {
          const cardWrap = item.querySelector(DOM.CARD_WRAP)
          const lng = item.querySelector(DOM.LONGITUDE)
          const lat = item.querySelector(DOM.LATITUDE)
          const id  = item.querySelector(DOM.LOCATION_ID)
          const card = item.querySelector(DOM.CARD)

          if (!lng || !lat) return null

          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng.value), parseFloat(lat.value)],
            },
            properties: {
              locationId: id ? id.value : '',
              description: card ? card.innerHTML : '',
              // The card-wrap's own id attribute (e.g. id="auas-valley")
              cardWrapId: cardWrap ? cardWrap.id : '',
            },
          }
        })
        .filter(Boolean),
    }
  }
}
