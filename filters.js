
// Initialize filtering functionality using Finsweet CMS Filter
export function initializeFilters() {
  // Check if we have both filter elements and items to filter
  const filterForm = document.querySelector('[fs-cmsfilter-element="filters"]')
  const filterList = document.querySelector('[fs-cmsfilter-element="list"]')


  if (!filterForm || !filterList) {
    return
  }

  // 1. Get References to Elements
  const checkboxes = document.querySelectorAll('input[type="checkbox"]')
  const cmsItems = document.querySelectorAll('.location-map_card-wrap')
  const itemTagsCache = new Map()


  // 2. Function to get selected tags grouped by category
  function getSelectedTagsByCategory() {
    const tagsByCategory = new Map()

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        // Get the label text which contains the tag name
        const tag = checkbox.parentElement
          ?.querySelector('.w-form-label')
          ?.textContent?.trim()
        // Get category from the closest heading
        const category =
          checkbox
            .closest('div')
            ?.previousElementSibling?.textContent?.trim() || 'default'

        if (tag) {
          if (!tagsByCategory.has(category)) {
            tagsByCategory.set(category, new Set())
          }
          tagsByCategory.get(category).add(tag)
        }
      }
    })

    return tagsByCategory
  }

  // 3. Function to get or create cached item tags
  function getItemTags(item) {
    if (itemTagsCache.has(item)) {
      return itemTagsCache.get(item)
    }

    const itemTags = []

    // Get all checkbox labels within the item
    const tagLabels = item.querySelectorAll('.w-form-label')
    tagLabels.forEach((label) => {
      const tag = label.textContent.trim()
      if (tag) itemTags.push(tag)
    })

    // Get listing type
    const listingType = item.querySelector('.contact-text')?.textContent?.trim()
    if (listingType) itemTags.push(listingType)

    itemTagsCache.set(item, itemTags)
    return itemTags
  }

  // 4. Function to Filter Items
  function filterItems() {
    const selectedTagsByCategory = getSelectedTagsByCategory()

    // If no filters are selected, show all items
    if (selectedTagsByCategory.size === 0) {
      cmsItems.forEach((item) => {
        item.style.display = ''
      })
      return
    }

    // Filter items
    let visibleCount = 0
    cmsItems.forEach((item) => {
      const itemTags = getItemTags(item)

      // Check if the item matches ALL categories (AND between categories)
      const matchesAllCategories = Array.from(
        selectedTagsByCategory.entries()
      ).every(([category, categoryTags]) => {
        // Check if the item matches ANY tag in this category (OR within category)
        const matches = Array.from(categoryTags).some((tag) => {
          const hasMatch = itemTags.some(
            (itemTag) => itemTag.toLowerCase() === tag.toLowerCase()
          )
          return hasMatch
        })
        return matches
      })

      // Show or hide the item based on the filter result
      item.style.display = matchesAllCategories ? '' : 'none'
      if (matchesAllCategories) visibleCount++
    })

  }

  // 5. Clear filters function
  function clearFilters() {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false
    })
    filterItems()
  }

  // 6. Add clear filters button if it exists
  const clearFiltersBtn = document.querySelector('.clear-filters-button')
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters)
  }

  // 7. Attach Event Listeners to Checkboxes
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', filterItems)
  })

  // 8. Initialize filters on page load
  filterItems()
}
