import { DOM, ACTIVE_CLASS, WF_STYLE_OVERRIDES } from '../config/selectors.js'

/**
 * UIService – Global delegated event listeners for the store locator.
 *
 * Handles:
 *   • Sidebar list-item clicks  → dispatch `markerClick`
 *   • Close-block clicks        → deactivate all items
 *   • Close-list clicks         → hide the map-panel list
 */
export class UIService {
  static setMapInstance(map) {
    UIService._mapInstance = map
  }

  static setupEventListeners() {
    // ── Close the map-panel list ──────────────────────────────
    document.addEventListener('click', (e) => {
      if (e.target.closest(DOM.CLOSE_LIST)) {
        const list = document.querySelector(DOM.MAP_PANEL_LIST)
        if (list) list.classList.remove('active')
      }
    })

    // ── Close-block (✕ button inside a card) ─────────────────
    document.addEventListener('click', (e) => {
      if (!e.target.closest(DOM.CLOSE_BLOCK)) return

      e.stopPropagation()
      UIService.deactivateAll()
    })

    // ── Sidebar list-item click → fly to marker ──────────────
    document.addEventListener('click', (e) => {
      // Walk up to the sidebar .w-dyn-item
      const listItem = e.target.closest(DOM.SIDEBAR_ITEMS)
      if (!listItem) return

      // Allow action links, dropdowns, and close buttons to work normally
      const isDropdown    = e.target.closest('.w-dropdown-toggle')
      const isCloseBtn    = e.target.closest(DOM.CLOSE_BLOCK)
      const isActionLink  = e.target.closest('a.action-block')
      if (isDropdown || isCloseBtn || isActionLink) return

      // Prevent default for any wrapping <a> tag (link-blocks)
      const closestLink = e.target.closest('a')
      if (closestLink) e.preventDefault()

      // Read location data from the hidden inputs
      const lat = listItem.querySelector(DOM.LATITUDE)
      const lng = listItem.querySelector(DOM.LONGITUDE)
      const id  = listItem.querySelector(DOM.LOCATION_ID)
      if (!lat || !lng) return

      const coords = [parseFloat(lng.value), parseFloat(lat.value)]
      const locationId = id ? id.value : ''

      // Dispatch the same event a marker click would
      document.dispatchEvent(
        new CustomEvent('markerClick', {
          detail: {
            features: [{
              geometry: { coordinates: coords },
              properties: { locationId },
            }],
            lngLat: { lng: coords[0], lat: coords[1] },
          },
        })
      )
    })
  }

  // ── Helpers ──────────────────────────────────────────────────

  /** Remove `is--show` from every active item + card-wrap and reset Webflow styles. */
  static deactivateAll() {
    // Sidebar items
    document.querySelectorAll(`${DOM.SIDEBAR_ITEMS}.${ACTIVE_CLASS}`).forEach((el) => {
      el.classList.remove(ACTIVE_CLASS)
      WF_STYLE_OVERRIDES.forEach((p) => el.style.removeProperty(p))
    })

    // Sidebar card-wraps
    document.querySelectorAll(
      `${DOM.SIDEBAR_ITEMS} ${DOM.CARD_WRAP}.${ACTIVE_CLASS}`
    ).forEach((el) => el.classList.remove(ACTIVE_CLASS))

    // Map-panel items
    document.querySelectorAll(`${DOM.MAP_PANEL_ITEMS}.${ACTIVE_CLASS}`).forEach((el) => {
      el.classList.remove(ACTIVE_CLASS)
      WF_STYLE_OVERRIDES.forEach((p) => el.style.removeProperty(p))
    })

    // Map-panel card-wraps
    document.querySelectorAll(
      `${DOM.MAP_PANEL_ITEMS} ${DOM.CARD_WRAP}.${ACTIVE_CLASS}`
    ).forEach((el) => el.classList.remove(ACTIVE_CLASS))
  }
}
