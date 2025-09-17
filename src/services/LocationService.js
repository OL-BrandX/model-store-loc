export class LocationService {
  static async getUserLocation() {
    // Default coordinates for Windhoek Central
    const defaultLocation = {
      lng: 17.080475533746686,
      lat: -22.573475211818067,
      isDefault: true,
    }

    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        // Set a timeout for the geolocation request
        const timeoutId = setTimeout(() => {
          resolve(defaultLocation)
        }, 5000)

        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId)
            resolve({
              lng: position.coords.longitude,
              lat: position.coords.latitude,
              isDefault: false,
            })
          },
          (error) => {
            clearTimeout(timeoutId)
            resolve(defaultLocation)
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        )
      } else {
        resolve(defaultLocation)
      }
    })
  }

  static getGeoData() {
    const locationNodes = document.querySelectorAll('#location-list > *')
    return {
      type: 'FeatureCollection',
      features: Array.from(locationNodes).map((location, index) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(location.querySelector('#locationLongitude').value),
            parseFloat(location.querySelector('#locationLatitude').value),
          ],
        },
        properties: {
          id: location.querySelector('#locationID').value,
          description: location.querySelector('.locations-map_card').innerHTML,
          arrayID: index,
        },
      })),
    }
  }
}
