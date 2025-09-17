export function initializeListingManager() {
  try {
    setupListingPrefill()
    textFade()
  } catch (error) {
    // Silent error handling
  }
}

function setupListingPrefill() {
  const listingElement = document.getElementById('Listing_name')
  const formField = document.getElementById('Business-Listing')

  if (listingElement && formField) {
    // Get the text content from the listing element
    const listingText = listingElement.textContent

    // Prefill the form field
    formField.value = listingText

    // Disable the form field
    formField.disabled = true
  }
}

function textFade() {
  const textContent = document.getElementById('listings_main')
  const readMoreButton = document.getElementById('read-more-button')

  // Check if both elements exist before adding event listener
  if (textContent && readMoreButton) {
    readMoreButton.addEventListener('click', () => {
      if (textContent.style.maxHeight === 'none') {
        textContent.style.maxHeight = '50px'
        readMoreButton.textContent = 'Read More'
      } else {
        textContent.style.maxHeight = 'none'
        readMoreButton.textContent = 'Read Less'
      }
    })
  }
}
