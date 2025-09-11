export const mapConfig = {
  accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
  style: 'mapbox://styles/mapbox/streets-v12',
  minZoom: 2,
  defaultMapSettings: {
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [17.088, -22.574],
    zoom: 15, //starting zoom
  },
  markerColors: {
    user: '#FF0000',
    location: '#FF9900',
  },
  layerSettings: {
    id: 'locations',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 6, 15, 12],
      'circle-stroke-width': 1,
      'circle-color': '#FF9900',
      'circle-opacity': 0.9,
      'circle-stroke-color': '#405F3B',
    },
  },
}
