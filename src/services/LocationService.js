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
    const locationNodes = document.querySelectorAll('#location-list > *, .collection-list-3.w-dyn-items > .w-dyn-item')
    return {
      type: 'FeatureCollection',
      features: Array.from(locationNodes).map((location, index) => {
        const lngInput = location.querySelector('#locationLongitude')
        const latInput = location.querySelector('#locationLatitude')
        const idInput = location.querySelector('#locationID')
        const cardNode = location.querySelector('.locations-map_card')
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              lngInput ? parseFloat(lngInput.value) : 0,
              latInput ? parseFloat(latInput.value) : 0,
            ],
          },
          properties: {
            id: idInput ? idInput.value : '',
            description: cardNode ? cardNode.innerHTML : '',
            arrayID: index,
          },
        }
      }),
    }
  }
}
