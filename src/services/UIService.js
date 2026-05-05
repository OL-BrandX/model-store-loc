export class UIService {
  static setMapInstance(map) {
    UIService._mapInstance = map
  }

  static setupEventListeners() {
    // Close location list when close button is clicked
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('close-list')) {
        const locationList = document.getElementById('location-list')
        if (locationList) {
          locationList.classList.remove('active')
        }
      }
    })

    // Update close block event listener to be more robust
    const closeBlock = document.querySelector('.close-block')
    if (closeBlock) {
      closeBlock.addEventListener('click', () => {
        const wrapper = document.querySelector('.locations-map_wrapper')
        if (wrapper) {
          wrapper.classList.remove('is--show')
        }
      })
    }

    // Also handle clicks on the close icon inside close-block
    document.addEventListener('click', (e) => {
      const closeIcon = e.target.closest('.close-block')
      if (closeIcon) {
        const wrapper = document.querySelector('.locations-map_wrapper')
        if (wrapper) {
          wrapper.classList.remove('is--show')
        }
      }
    })

    // Handle clicks on location list items to trigger marker logic
    document.addEventListener('click', (e) => {
      const listItem = e.target.closest('.collection-list-3.w-dyn-items > .w-dyn-item, .locations-map_item')
      
      // Avoid triggering when clicking action buttons or dropdowns inside the list item
      if (listItem && !e.target.closest('a') && !e.target.closest('.w-dropdown-toggle')) {
        // Find index of this item to send as arrayID
        const locationNodes = document.querySelectorAll('#location-list > *, .collection-list-3.w-dyn-items > .w-dyn-item')
        const arrayID = Array.from(locationNodes).indexOf(listItem)
        
        if (arrayID !== -1) {
          const latInput = listItem.querySelector('#locationLatitude')
          const lngInput = listItem.querySelector('#locationLongitude')
          const idInput = listItem.querySelector('#locationID')
          const descEl = listItem.querySelector('.locations-map_card')
          
          if (latInput && lngInput) {
            const clickEvent = {
              features: [
                {
                  geometry: {
                    coordinates: [parseFloat(lngInput.value), parseFloat(latInput.value)],
                  },
                  properties: {
                    id: idInput ? idInput.value : '',
                    description: descEl ? descEl.innerHTML : '',
                    arrayID: arrayID,
                  },
                },
              ],
              lngLat: {
                lng: parseFloat(lngInput.value),
                lat: parseFloat(latInput.value),
              },
            }
            
            const customEvent = new CustomEvent('markerClick', {
              detail: clickEvent,
            })
            document.dispatchEvent(customEvent)
          }
        }
      }
    })
  }
}
