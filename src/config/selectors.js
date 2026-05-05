/**
 * Central DOM selector definitions for the store locator.
 *
 * The Webflow page has TWO separate CMS collection lists:
 *
 * 1. SIDEBAR list  – `.collection-list-3 > .w-dyn-item`
 *    Rendered in the left search/filter panel. Each item wraps a
 *    `.location-map_card-wrap[id]` that holds the hidden inputs.
 *
 * 2. MAP PANEL list – `#location-list > .locations-map_item`
 *    Rendered inside `.locations-map_wrapper` overlaying the map.
 *    Each item also wraps a `.location-map_card-wrap` with hidden inputs.
 *
 * Both lists carry the same data; we use the SIDEBAR as the canonical
 * data source (it drives search/filter) and activate items in BOTH
 * lists when a location is selected.
 */
export const DOM = {
  // ── Data source (sidebar) ──────────────────────────────────
  SIDEBAR_ITEMS: '.collection-list-3.w-dyn-items > .w-dyn-item',

  // ── Map overlay panel ──────────────────────────────────────
  MAP_PANEL_WRAPPER: '.locations-map_wrapper',
  MAP_PANEL_LIST: '#location-list',
  MAP_PANEL_ITEMS: '#location-list > .locations-map_item',

  // ── Shared card elements ───────────────────────────────────
  CARD_WRAP: '.location-map_card-wrap',
  CARD: '.locations-map_card',

  // ── Hidden inputs inside every card ────────────────────────
  LOCATION_ID: '#locationID',
  LATITUDE: '#locationLatitude',
  LONGITUDE: '#locationLongitude',

  // ── Marker icon ────────────────────────────────────────────
  MARKER_ICON: '.markericon img',

  // ── UI controls ────────────────────────────────────────────
  CLOSE_BLOCK: '.close-block',
  CLOSE_LIST: '.close-list',

  // ── Map container ──────────────────────────────────────────
  MAP_CONTAINER: '#map',
}

/** CSS class toggled on active items / card-wraps */
export const ACTIVE_CLASS = 'is--show'

/** Webflow inline styles that may block visibility */
export const WF_STYLE_OVERRIDES = ['transform', 'filter', 'perspective', 'will-change']
