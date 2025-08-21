import { supabaseDataService } from './supabase-data-service.js'

/**
 * Enhanced Rules Engine for Supabase-based Quote Builder
 * Manages complex conditional logic using database-stored conditions
 */

export class SupabaseRulesEngine {
  constructor() {
    this.cache = new Map()
  }

  /**
   * Evaluate section conditions to determine if a section should be visible
   */
  evaluateSectionConditions(sectionConditions, selections) {
    if (!sectionConditions || sectionConditions.length === 0) {
      return true
    }

    // Each outer array represents an OR condition (condition groups)
    return sectionConditions.some(conditionGroup => {
      // Each condition in the group must be true (AND)
      return conditionGroup.every(condition => {
        return this.evaluateCondition(condition, selections)
      })
    })
  }

  /**
   * Evaluate option conditions to get visible options for a section
   */
  evaluateOptionConditions(optionConditions, selections) {
    if (!optionConditions || optionConditions.length === 0) {
      return null // Show all options
    }

    const visibleOptions = new Set()

    optionConditions.forEach((condition, index) => {
      // Check if all params in this condition are met
      const conditionMet = condition.params.every(param => {
        const result = this.evaluateCondition(param, selections)
        
        // Debug section 16 condition evaluation
        if (selections[14] && selections[14][0] === 121) { // Only when Steel Stud selected
          console.log(`[DEBUG S16] Group ${index}, Param:`, param, `Result: ${result}`)
        }
        
        return result
      })

      // Debug which groups are matching
      if (selections[14] && selections[14][0] === 121 && conditionMet) {
        console.log(`[DEBUG S16] Group ${index} MATCHED! Shows:`, condition.show)
      }

      if (conditionMet && condition.show) {
        condition.show.forEach(optionId => visibleOptions.add(optionId))
      }
    })

    const result = Array.from(visibleOptions)
    console.log(`[DEBUG] Combined visible options:`, result)
    return result.length > 0 ? result : null
  }

  /**
   * Evaluate a single condition (IN, NOT, NOT_MULTI)
   * Now properly handles database fields: condition_type, allow_null
   */
  evaluateCondition(condition, selections) {
    // Handle both JSON structure (condition) and database structure (condition_type)
    const conditionType = condition.condition_type || condition.condition || 'IN'
    const allowNull = condition.allow_null || false
    const section = condition.required_section || condition.section
    const options = condition.required_options || condition.options || []
    
    const selectedOptions = selections[section] || []
    const selectedOption = selectedOptions[0] // Primary selection

    switch (conditionType) {
      case 'IN':
        // Check if selected option is in the required options
        if (allowNull && !selectedOption) {
          return true
        }
        return selectedOption ? options.includes(selectedOption) : false

      case 'NOT':
        // Check if selected option is NOT in the restricted options
        if (!selectedOption) {
          return true // No selection means condition is met
        }
        return !options.includes(selectedOption)

      case 'NOT_MULTI':
        // Complex multi-parameter condition logic
        if (condition.params) {
          return condition.params.every(param => {
            const paramSelections = selections[param.section] || []
            const paramSelection = paramSelections[0]
            return param.options.includes(paramSelection)
          })
        }
        return true

      default:
        console.warn(`Unknown condition type: ${conditionType}, defaulting to IN`)
        return selectedOption ? options.includes(selectedOption) : allowNull
    }
  }

  /**
   * Check if a section should be visible based on its section_conditions
   */
  async isSectionVisible(sectionId, selections, productId) {
    const cacheKey = `section_visible_${productId}_${sectionId}_${JSON.stringify(selections)}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const sectionConditions = await supabaseDataService.getSectionConditions(productId, sectionId)
    const result = this.evaluateSectionConditions(sectionConditions, selections)
    
    this.cache.set(cacheKey, result)
    return result
  }

  /**
   * Get visible options for a section based on its option_conditions
   */
  async getVisibleOptions(sectionId, selections, productId) {
    const cacheKey = `options_visible_${productId}_${sectionId}_${JSON.stringify(selections)}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const optionConditions = await supabaseDataService.getOptionConditions(productId, sectionId)
    console.log(`[DEBUG] Section ${sectionId} option conditions:`, optionConditions)
    console.log(`[DEBUG] Current selections:`, selections)
    
    const visibleOptionIds = this.evaluateOptionConditions(optionConditions, selections)
    
    // Debug section 16 specifically
    if (sectionId === 16) {
      console.log(`[DEBUG S16] Selection 14:`, selections[14])
      console.log(`[DEBUG S16] Option conditions:`, optionConditions)
    }
    
    console.log(`[DEBUG] Visible option IDs for section ${sectionId}:`, visibleOptionIds)
    
    // If no conditions matched, get all options for the section
    if (!visibleOptionIds) {
      const { options } = await supabaseDataService.getOptionsForSection(productId, sectionId)
      const result = Object.keys(options).map(Number)
      console.log(`[DEBUG] No conditions matched, showing all options:`, result)
      this.cache.set(cacheKey, result)
      return result
    }

    this.cache.set(cacheKey, visibleOptionIds)
    return visibleOptionIds
  }

  /**
   * Get all visible sections for a product based on current selections
   */
  async getVisibleSections(productId, selections) {
    const allSections = await supabaseDataService.getSectionsForProduct(productId)
    const visibleSections = []
    
    for (const section of allSections) {
      const isVisible = await this.isSectionVisible(section.id, selections, productId)
      if (isVisible) {
        // Get complete section data with options
        const completeSection = await supabaseDataService.getCompleteSection(productId, section.id)
        
        // Filter options based on option conditions
        const visibleOptionIds = await this.getVisibleOptions(section.id, selections, productId)
        
        // If we have option conditions, filter the options
        if (visibleOptionIds && completeSection.options) {
          const filteredOptions = {}
          visibleOptionIds.forEach(optionId => {
            if (completeSection.options[optionId]) {
              filteredOptions[optionId] = completeSection.options[optionId]
            }
          })
          completeSection.options = filteredOptions
        }
        
        visibleSections.push(completeSection)
      }
    }

    return visibleSections
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache() {
    this.cache.clear()
  }
}

// Create singleton instance
export const supabaseRulesEngine = new SupabaseRulesEngine()