import { supabaseDataService } from './supabase-data-service.js'

/**
 * Enhanced Rules Engine with Full Vue.js Feature Parity
 * Handles radio groups, clear options, multi-select, and all conditional patterns
 */

export class EnhancedSupabaseRulesEngine {
  constructor() {
    this.cache = new Map()
    this.radioGroupsCache = new Map()
  }

  /**
   * Get radio groups for a section (with caching)
   */
  async getRadioGroups(productId, sectionId) {
    const cacheKey = `radio_groups_${productId}_${sectionId}`
    if (this.radioGroupsCache.has(cacheKey)) {
      return this.radioGroupsCache.get(cacheKey)
    }

    try {
      const { data: radioGroups, error } = await supabaseDataService.supabase
        .from('radio_groups')
        .select(`
          id, title, allow_multi, display_order,
          radio_group_options!inner(option_id, display_order)
        `)
        .eq('product_type_id', productId)
        .eq('section_id', sectionId)
        .order('display_order')

      if (error) throw error

      // Format radio groups with their options
      const formattedGroups = radioGroups?.map(group => ({
        id: group.id,
        title: group.title,
        allow_multi: group.allow_multi,
        options: group.radio_group_options
          .sort((a, b) => a.display_order - b.display_order)
          .map(opt => opt.option_id)
      })) || []

      this.radioGroupsCache.set(cacheKey, formattedGroups)
      return formattedGroups
    } catch (error) {
      console.error('Error loading radio groups:', error)
      return []
    }
  }

  /**
   * Handle clear option logic - selecting a clear option deselects all others
   */
  handleClearOption(section, newSelection, currentSelections) {
    const clearOptionId = section.clear_option_id
    
    if (!clearOptionId) {
      return newSelection // No clear option defined
    }

    // If clear option is being selected, return only the clear option
    if (newSelection.includes(clearOptionId)) {
      return [clearOptionId]
    }

    // If any other option is being selected, remove clear option
    const withoutClear = newSelection.filter(id => id !== clearOptionId)
    return withoutClear.length > 0 ? withoutClear : newSelection
  }

  /**
   * Validate radio group constraints
   */
  async validateRadioGroupSelection(productId, sectionId, newSelection) {
    const radioGroups = await this.getRadioGroups(productId, sectionId)
    
    if (radioGroups.length === 0) {
      return { isValid: true, errors: [] } // No radio groups = no constraints
    }

    const errors = []

    // Check each radio group for violations
    radioGroups.forEach(group => {
      const selectedInGroup = newSelection.filter(optionId => group.options.includes(optionId))
      
      // If this group doesn't allow multiple selections but has multiple selected
      if (!group.allow_multi && selectedInGroup.length > 1) {
        errors.push(`Only one option can be selected in "${group.title}"`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Enhanced condition evaluation with "sections" typo handling
   */
  evaluateCondition(condition, selections) {
    // Handle both JSON structure and database structure + "sections" typo
    const conditionType = condition.condition_type || condition.condition || 'IN'
    const allowNull = condition.allow_null || false
    
    // Handle "sections" vs "section" typo from data-final.json
    const section = condition.required_section || condition.section || condition.sections
    const options = condition.required_options || condition.options || []
    
    if (section === undefined) {
      console.warn('Condition missing section field:', condition)
      return true // Default to visible if malformed
    }
    
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
   * Get enhanced section data with radio groups and clear options
   */
  async getEnhancedSectionData(productId, sectionId) {
    const section = await supabaseDataService.getCompleteSection(productId, sectionId)
    
    // Add radio groups if they exist
    const radioGroups = await this.getRadioGroups(productId, sectionId)
    section.radioGroups = radioGroups

    return section
  }

  /**
   * Process selection with all enhancements (clear options, radio groups, multi-select)
   */
  async processSelection(productId, sectionId, newSelection, currentSelections) {
    const section = await this.getEnhancedSectionData(productId, sectionId)
    const errors = []

    // 1. Handle clear option logic
    const afterClear = this.handleClearOption(section, newSelection, currentSelections)

    // 2. Handle multi-select constraints
    if (!section.multi_select && afterClear.length > 1) {
      errors.push('Only one option can be selected in this section')
      return { 
        processedSelection: [afterClear[0]], // Take first selection
        errors: [],
        warnings: ['Multiple selections not allowed - using first selection']
      }
    }

    // 3. Validate radio group constraints
    const radioValidation = await this.validateRadioGroupSelection(productId, sectionId, afterClear)
    if (!radioValidation.isValid) {
      errors.push(...radioValidation.errors)
    }

    return {
      processedSelection: afterClear,
      errors,
      warnings: []
    }
  }

  /**
   * Enhanced option visibility that considers all conditional patterns
   */
  async getVisibleOptions(sectionId, selections, productId) {
    const cacheKey = `options_visible_${productId}_${sectionId}_${JSON.stringify(selections)}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const optionConditions = await supabaseDataService.getOptionConditions(productId, sectionId)
    
    if (!optionConditions || optionConditions.length === 0) {
      // No conditions = show all options for this section
      const { options } = await supabaseDataService.getOptionsForSection(productId, sectionId)
      const result = Object.keys(options).map(Number)
      this.cache.set(cacheKey, result)
      return result
    }

    const visibleOptions = new Set()

    optionConditions.forEach(condition => {
      // Check if all params in this condition are met
      const conditionMet = condition.params.every(param => {
        return this.evaluateCondition(param, selections)
      })

      if (conditionMet && condition.show) {
        condition.show.forEach(optionId => visibleOptions.add(optionId))
      }
    })

    const result = Array.from(visibleOptions)
    
    // If no conditions matched but we have conditions defined, don't show any options
    // This is different from no conditions at all
    if (result.length === 0) {
      this.cache.set(cacheKey, [])
      return []
    }

    this.cache.set(cacheKey, result)
    return result
  }

  /**
   * Enhanced section visibility evaluation
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
   * Check if a section should be visible
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
   * Get all visible sections with enhanced option filtering
   */
  async getVisibleSections(productId, selections) {
    const allSections = await supabaseDataService.getSectionsForProduct(productId)
    const visibleSections = []
    
    for (const section of allSections) {
      const isVisible = await this.isSectionVisible(section.id, selections, productId)
      if (isVisible) {
        // Get complete section data with radio groups
        const completeSection = await this.getEnhancedSectionData(productId, section.id)
        
        // Filter options based on conditions
        const visibleOptionIds = await this.getVisibleOptions(section.id, selections, productId)
        
        // Apply option filtering
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
   * Clear all caches
   */
  clearCache() {
    this.cache.clear()
    this.radioGroupsCache.clear()
  }
}

// Create singleton instance
export const enhancedSupabaseRulesEngine = new EnhancedSupabaseRulesEngine()