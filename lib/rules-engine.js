import { quoteConfig } from './simple-config.js'

/**
 * Rules Engine for Quote Builder
 * Manages complex conditional logic for showing/hiding sections and options based on data-final.json
 */

export class QuoteRulesEngine {
  constructor() {
    this.data = quoteConfig
  }

  /**
   * Evaluate section conditions to determine if a section should be visible
   */
  evaluateSectionConditions(sectionConditions, selections) {
    if (!sectionConditions || sectionConditions.length === 0) {
      return true
    }

    // Each outer array represents an OR condition
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
    const visibleOptions = new Set()

    if (!optionConditions || optionConditions.length === 0) {
      return null // Show all options
    }

    optionConditions.forEach(condition => {
      // Check if all params in this condition are met
      const conditionMet = condition.params.every(param => {
        return this.evaluateCondition(param, selections)
      })

      if (conditionMet && condition.show) {
        condition.show.forEach(optionId => visibleOptions.add(optionId))
      }
    })

    return Array.from(visibleOptions)
  }

  /**
   * Evaluate a single condition (IN, NOT, NOT_MULTI)
   */
  evaluateCondition(condition, selections) {
    const { section, options = [], condition: conditionType = 'IN', allow_null = 0 } = condition
    const selectedOptions = selections[section] || []
    const selectedOption = selectedOptions[0] // Primary selection

    switch (conditionType) {
      case 'IN':
        // Check if selected option is in the required options
        if (allow_null && !selectedOption) {
          return true
        }
        return options.includes(selectedOption)

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
        return true
    }
  }

  /**
   * Check if a section should be visible based on its section_conditions
   */
  isSectionVisible(sectionId, selections, productId) {
    const section = this.data.sections[productId]?.[sectionId]
    if (!section) return false

    return this.evaluateSectionConditions(section.section_conditions, selections)
  }

  /**
   * Get visible options for a section based on its option_conditions
   */
  getVisibleOptions(sectionId, selections, productId) {
    const section = this.data.sections[productId]?.[sectionId]
    if (!section) return []

    const visibleOptionIds = this.evaluateOptionConditions(section.option_conditions, selections)
    
    // If no conditions matched, show all options
    if (!visibleOptionIds) {
      return Object.keys(section.options).map(Number)
    }

    return visibleOptionIds
  }

  /**
   * Get all visible sections for a product based on current selections
   */
  getVisibleSections(productId, selections) {
    const sections = this.data.sections[productId]
    if (!sections) return []

    const visibleSections = []
    
    Object.entries(sections).forEach(([sectionId, section]) => {
      if (this.isSectionVisible(parseInt(sectionId), selections, productId)) {
        visibleSections.push({
          id: parseInt(sectionId),
          ...section
        })
      }
    })

    return visibleSections.sort((a, b) => a.id - b.id)
  }
}

// Create singleton instance
export const rulesEngine = new QuoteRulesEngine()