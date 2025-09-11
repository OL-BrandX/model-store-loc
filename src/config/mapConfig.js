export const mapConfig = {
  accessToken:
    'pk.eyJ1IjoiYnJhbmR4IiwiYSI6ImNtZmR5dnFvYjAxMXIya3I5eG1rN3Nxc20ifQ.yna2pnOayMxz_3inlaHxww',
  style: 'mapbox://styles/mapbox/streets-v12',
  minZoom: 2,
  defaultMapSettings: {
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    minZoom: 2,
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
