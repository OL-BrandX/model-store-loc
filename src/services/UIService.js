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
  }
}
