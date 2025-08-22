// Helper functions for working with the Supabase-based quote config
import { getProductTypes, getSectionsForProduct } from './supabase-config.js'
import { supabaseRulesEngine } from './supabase-rules-engine.js'
import { supabaseDataService } from './supabase-data-service.js'

// Validation helpers
export function validateSelections(sections, selections) {
  const errors = []
  const warnings = []
  let isValid = true
  
  // For now, treat all sections as required since the data structure doesn't specify
  sections.forEach(section => {
    const selection = selections[section.id]
    if (!selection || selection.length === 0) {
      errors.push(`${section.title} selection is required`)
      isValid = false
    }
  })
  
  return {
    isValid,
    errors,
    warnings,
    canProceed: errors.length === 0
  }
}

// Validate only the current section - for step-by-step validation
export function validateCurrentSection(currentSection, selections) {
  const errors = []
  const warnings = []
  let isValid = true
  
  if (currentSection) {
    const selection = selections[currentSection.id]
    if (!selection || selection.length === 0) {
      errors.push(`${currentSection.title} selection is required`)
      isValid = false
    }
  }
  
  return {
    isValid,
    errors,
    warnings,
    canProceed: errors.length === 0
  }
}

// Get the next available step using rules engine
export async function getNextStep(currentStep, sections, selections, productId) {
  for (let i = currentStep + 1; i < sections.length; i++) {
    const section = sections[i]
    
    // Check if this section should be visible using rules engine
    const isVisible = await supabaseRulesEngine.isSectionVisible(section.id, selections, productId)
    if (isVisible) {
      return i
    }
  }
  
  return currentStep // Stay on current step if no next step found
}

// Get the previous available step using rules engine
export async function getPrevStep(currentStep, sections, selections, productId) {
  for (let i = currentStep - 1; i >= 0; i--) {
    const section = sections[i]
    
    // Check if this section should be visible using rules engine
    const isVisible = await supabaseRulesEngine.isSectionVisible(section.id, selections, productId)
    if (isVisible) {
      return i
    }
  }
  
  return 0 // Go to first step if no previous step found
}

// Get visible sections based on current selections using rules engine
export async function getVisibleSections(productId, selections) {
  return await supabaseRulesEngine.getVisibleSections(productId, selections)
}

// Calculate quote completeness
export function getQuoteCompleteness(sections, selections) {
  // Only count visible sections as required - this fixes the bug where hidden sections
  // were still being counted in the total, making completion impossible
  const completedSections = sections.filter(section => {
    const selection = selections[section.id]
    const isCompleted = selection && selection.length > 0
    return isCompleted
  })
  
  // Don't mark as complete if no sections are loaded yet
  const isComplete = sections.length > 0 && completedSections.length === sections.length
  
  return {
    total: sections.length,
    completed: completedSections.length,
    percentage: sections.length > 0 ? (completedSections.length / sections.length) * 100 : 0,
    isComplete
  }
}

// Get summary of selections for display
export async function getSelectionsSummary(productId, selections) {
  const sections = await getSectionsForProduct(productId)
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
    40: 300,  // Frame only base price
    50: 200,  // Lite kits
    70: 150,  // Hardware
    80: 100   // Louvers
  }[productId] || 500
  
  let adjustments = 0
  
  // Add simple price adjustments based on selections
  Object.entries(selections).forEach(([sectionId, optionIds]) => {
    optionIds.forEach(optionId => {
      // Example adjustments based on common option patterns
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
    localStorage.setItem('supabase-quote', JSON.stringify(quoteData))
  } catch (error) {
    console.warn('Could not save quote to storage:', error)
  }
}

export function loadQuoteFromStorage() {
  try {
    const data = localStorage.getItem('supabase-quote')
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.warn('Could not load quote from storage:', error)
    return null
  }
}

export function clearQuoteFromStorage() {
  try {
    localStorage.removeItem('supabase-quote')
  } catch (error) {
    console.warn('Could not clear quote from storage:', error)
  }
}

// Format options for display using Supabase data
export async function formatOptionsForDisplay(section, selections, productId) {
  const visibleOptionIds = await supabaseRulesEngine.getVisibleOptions(section.id, selections, productId)
  
  // If no rules apply, show all options
  const optionsToShow = visibleOptionIds?.length > 0 ? visibleOptionIds : Object.keys(section.options).map(Number)
  
  return optionsToShow
    .filter(optionId => section.options[optionId]) // Only include existing options
    .sort((a, b) => {
      const aIndex = section.order?.indexOf(a) ?? 999
      const bIndex = section.order?.indexOf(b) ?? 999
      return aIndex - bIndex
    })
    .map(id => ({
      id,
      name: section.options[id].name,
      description: section.options[id].description || '',
      tooltip: section.options[id].tooltip || '',
      image: section.options[id].primary_image || '/placeholder.svg',
      popular: section.options[id].is_most_popular === true,
      customInput: section.options[id].requires_input === true,
      selected: selections[section.id]?.includes(id) || false
    }))
}