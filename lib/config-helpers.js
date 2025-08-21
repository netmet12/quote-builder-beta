// Helper functions for working with the quote config using rules engine
import { quoteConfig, getProductTypes, getSectionsForProduct } from './simple-config.js'
import { rulesEngine } from './rules-engine.js'

// Validation helpers
export function validateSelections(sections, selections) {
  const errors = []
  const warnings = []
  let isValid = true
  
  // Check that all required sections have selections
  sections.forEach(section => {
    if (section.required) {
      const selection = selections[section.id]
      if (!selection || selection.length === 0) {
        errors.push(`${section.title} is required`)
        isValid = false
      }
    }
  })
  
  return {
    isValid,
    errors,
    warnings,
    canProceed: errors.length === 0
  }
}

// Get the next available step using rules engine
export async function getNextStep(currentStep, sections, selections) {
  for (let i = currentStep + 1; i < sections.length; i++) {
    const section = sections[i]
    
    // Check if this section should be visible using rules engine
    if (!section.conditions || await rulesEngine.isSectionVisible(section.id, selections)) {
      return i
    }
  }
  
  return currentStep // Stay on current step if no next step found
}

// Get the previous available step using rules engine
export async function getPrevStep(currentStep, sections, selections) {
  for (let i = currentStep - 1; i >= 0; i--) {
    const section = sections[i]
    
    // Check if this section should be visible using rules engine
    if (!section.conditions || await rulesEngine.isSectionVisible(section.id, selections)) {
      return i
    }
  }
  
  return 0 // Go to first step if no previous step found
}

// Get visible sections based on current selections using rules engine
export async function getVisibleSections(productId, selections) {
  const allSections = getSectionsForProduct(productId)
  
  const visibleSections = []
  
  for (const section of allSections) {
    if (!section.conditions || await rulesEngine.isSectionVisible(section.id, selections)) {
      visibleSections.push(section)
    }
  }
  
  return visibleSections
}

// Calculate quote completeness
export function getQuoteCompleteness(sections, selections) {
  const requiredSections = sections.filter(s => s.required)
  const completedSections = requiredSections.filter(section => {
    const selection = selections[section.id]
    return selection && selection.length > 0
  })
  
  return {
    total: requiredSections.length,
    completed: completedSections.length,
    percentage: requiredSections.length > 0 ? (completedSections.length / requiredSections.length) * 100 : 0,
    isComplete: completedSections.length === requiredSections.length
  }
}

// Get summary of selections for display
export function getSelectionsSummary(productId, selections) {
  const sections = getSectionsForProduct(productId)
  const summary = []
  
  sections.forEach(section => {
    const selection = selections[section.id]
    if (selection && selection.length > 0) {
      const selectedOptions = selection.map(optionId => {
        const option = section.options[optionId]
        return option ? option.name : `Option ${optionId}`
      })
      
      summary.push({
        section: section.title,
        selections: selectedOptions
      })
    }
  })
  
  return summary
}

// Simple price calculation (placeholder - would integrate with real pricing)
export function calculatePrice(productId, selections) {
  const basePrice = {
    10: 500, // Metal door base price
    20: 400, // Wood door base price  
    30: 1000, // Metal building door base price
    40: 300  // Frame only base price
  }[productId] || 500
  
  let adjustments = 0
  
  // Add simple price adjustments based on selections
  Object.entries(selections).forEach(([sectionId, optionIds]) => {
    optionIds.forEach(optionId => {
      // Example adjustments
      if (optionId === 71) adjustments += 150 // Custom size
      if ([87, 88, 89, 90].includes(optionId)) adjustments += 200 // Fire rating
      if ([70].includes(optionId)) adjustments += 100 // 8' height
    })
  })
  
  return {
    basePrice,
    adjustments,
    total: basePrice + adjustments
  }
}

// Storage helpers for persistence
export function saveQuoteToStorage(quoteData) {
  try {
    localStorage.setItem('simple-quote', JSON.stringify(quoteData))
  } catch (error) {
    console.warn('Could not save quote to storage:', error)
  }
}

export function loadQuoteFromStorage() {
  try {
    const data = localStorage.getItem('simple-quote')
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.warn('Could not load quote from storage:', error)
    return null
  }
}

export function clearQuoteFromStorage() {
  try {
    localStorage.removeItem('simple-quote')
  } catch (error) {
    console.warn('Could not clear quote from storage:', error)
  }
}

// Format options for display using rules engine
export async function formatOptionsForDisplay(section, selections) {
  const visibleOptionIds = await rulesEngine.getVisibleOptions(section.id, selections)
  
  // If no rules apply, show all options
  const optionsToShow = visibleOptionIds.length > 0 ? visibleOptionIds : Object.keys(section.options).map(Number)
  
  return optionsToShow
    .filter(optionId => section.options[optionId]) // Only include existing options
    .sort((a, b) => {
      const aIndex = section.order?.indexOf(a) ?? 999
      const bIndex = section.order?.indexOf(b) ?? 999
      return aIndex - bIndex
    })
    .map(id => ({
      id,
      ...section.options[id],
      selected: selections[section.id]?.includes(id) || false
    }))
}