import dataFinal from './data-final.json'

export const quoteConfig = dataFinal

// Helper functions for working with the config
export function getProductTypes() {
  return Object.entries(quoteConfig._types).map(([id, name]) => ({
    id: parseInt(id),
    name,
    description: quoteConfig._type_descriptions[id] || '',
    image: quoteConfig._type_images[id] || '/placeholder.svg'
  }))
}

export function getSectionsForProduct(productId) {
  const sections = quoteConfig.sections[productId]
  if (!sections) return []
  
  return Object.entries(sections).map(([id, section]) => ({
    id: parseInt(id),
    ...section
  })).sort((a, b) => a.id - b.id)
}

export function checkConditions(section, selections) {
  if (!section.conditions) return true
  
  return section.conditions.some(condition => {
    const { when } = condition
    const selection = selections[when.section]
    if (!selection) return false
    
    return when.options.some(optionId => selection.includes(optionId))
  })
}

export function getVisibleOptions(section, selections) {
  if (!section.conditions) return section.options
  
  const visibleOptionIds = new Set()
  
  // Check each condition
  section.conditions.forEach(condition => {
    if (checkConditions({ conditions: [condition] }, selections)) {
      condition.show.forEach(optionId => visibleOptionIds.add(optionId))
    }
  })
  
  // If no conditions matched, show all options
  if (visibleOptionIds.size === 0) {
    return section.options
  }
  
  // Filter options to only show visible ones
  const visibleOptions = {}
  Object.entries(section.options).forEach(([id, option]) => {
    if (visibleOptionIds.has(parseInt(id))) {
      visibleOptions[id] = option
    }
  })
  
  return visibleOptions
}