import type { QuoteSelection, ConfigurationSection } from "@/types/quote-builder"
import type { ValidationMessage } from "@/components/validation/warning-display"

export interface ComplianceRule {
  id: string
  name: string
  category: "building_code" | "manufacturing" | "installation" | "pricing" | "safety"
  priority: "critical" | "high" | "medium" | "low"
  conditions: RuleCondition[]
  actions: RuleAction[]
  description: string
}

export interface RuleCondition {
  type: "section_selection" | "option_value" | "custom_input" | "combination" | "measurement"
  sectionId?: number
  optionIds?: number[]
  value?: string | number
  operator?: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in_range"
  range?: [number, number]
}

export interface RuleAction {
  type: "block" | "warn" | "suggest" | "price_adjustment" | "require_approval"
  message: string
  severity: "error" | "warning" | "info"
  priceAdjustment?: number
  suggestedOptions?: number[]
}

export interface ComplianceResult {
  isCompliant: boolean
  requiresApproval: boolean
  blockedRules: ComplianceRule[]
  warningRules: ComplianceRule[]
  suggestions: ComplianceRule[]
  priceAdjustments: { rule: string; amount: number; description: string }[]
  messages: ValidationMessage[]
}

/**
 * Comprehensive business rules engine for TRUDOOR compliance
 */
export class BusinessRulesEngine {
  private static rules: ComplianceRule[] = [
    // Building Code Compliance Rules
    {
      id: "fire_door_wall_construction",
      name: "Fire Door Wall Construction Requirements",
      category: "building_code",
      priority: "critical",
      description: "3-hour fire doors require special wall construction and cannot be retrofit into existing walls",
      conditions: [
        { type: "section_selection", sectionId: 8, optionIds: [64] }, // 3-hour fire rating
        { type: "section_selection", sectionId: 15, optionIds: [97] }, // Wall already built
      ],
      actions: [
        {
          type: "block",
          message:
            "3-hour fire doors require the wall to be built around the frame with special fire-resistant materials. Cannot be installed in existing walls.",
          severity: "error",
        },
      ],
    },
    {
      id: "ada_door_width_compliance",
      name: "ADA Door Width Requirements",
      category: "building_code",
      priority: "high",
      description: "Exterior doors must meet ADA width requirements for accessibility",
      conditions: [
        { type: "section_selection", sectionId: 7, optionIds: [84] }, // Exterior application
        { type: "measurement", sectionId: 3, operator: "less_than", value: 32 }, // Width < 32"
      ],
      actions: [
        {
          type: "warn",
          message:
            "Exterior doors less than 32 inches wide may not meet ADA accessibility requirements. Consider upgrading to a 32-inch or wider door for compliance.",
          severity: "warning",
          suggestedOptions: [6, 8], // 32" and 36" width options
        },
      ],
    },
    {
      id: "fire_rating_hardware_compatibility",
      name: "Fire-Rated Door Hardware Requirements",
      category: "building_code",
      priority: "high",
      description: "Fire-rated doors require compatible fire-rated hardware",
      conditions: [
        { type: "section_selection", sectionId: 8, optionIds: [60, 61, 62, 63, 64] }, // Any fire rating
      ],
      actions: [
        {
          type: "suggest",
          message:
            "Fire-rated doors require fire-rated hardware including hinges, locks, and closers. Ensure all hardware meets the same fire rating as the door.",
          severity: "info",
        },
      ],
    },

    // Manufacturing Constraint Rules
    {
      id: "oversized_door_manufacturing",
      name: "Oversized Door Manufacturing Constraints",
      category: "manufacturing",
      priority: "medium",
      description: "Large doors may have manufacturing limitations and extended lead times",
      conditions: [
        { type: "measurement", sectionId: 3, operator: "greater_than", value: 42 }, // Width > 42"
        { type: "measurement", sectionId: 4, operator: "greater_than", value: 84 }, // Height > 84"
      ],
      actions: [
        {
          type: "warn",
          message:
            'Oversized doors (>42" wide and >84" tall) require special manufacturing processes and may have extended lead times of 6-8 weeks.',
          severity: "warning",
        },
        {
          type: "price_adjustment",
          message: "Oversized door surcharge",
          severity: "info",
          priceAdjustment: 250,
        },
      ],
    },
    {
      id: "embossing_lite_kit_conflict",
      name: "Embossing and Lite Kit Compatibility",
      category: "manufacturing",
      priority: "critical",
      description: "Embossed doors cannot accommodate lite kits due to manufacturing constraints",
      conditions: [
        { type: "section_selection", sectionId: 10, optionIds: [91, 92] }, // Any embossing
        { type: "section_selection", sectionId: 11, optionIds: [66, 67, 68, 69, 70, 71] }, // Any lite kit
      ],
      actions: [
        {
          type: "block",
          message:
            "Embossed doors cannot have lite kits due to manufacturing constraints. Please choose either embossing or a lite kit, not both.",
          severity: "error",
        },
      ],
    },
    {
      id: "manufacturer_height_limitations",
      name: "Manufacturer Height Limitations",
      category: "manufacturing",
      priority: "medium",
      description: "Tall doors have limited manufacturer availability",
      conditions: [{ type: "measurement", sectionId: 4, operator: "greater_than", value: 96 }], // Height > 96"
      actions: [
        {
          type: "warn",
          message:
            "Doors taller than 8 feet have limited manufacturer availability. Some finish and hardware options may not be available.",
          severity: "warning",
        },
        {
          type: "require_approval",
          message: "Tall door configuration requires engineering approval",
          severity: "info",
        },
      ],
    },

    // Installation Requirement Rules
    {
      id: "steel_stud_fire_rating_installation",
      name: "Steel Stud Fire Rating Installation Requirements",
      category: "installation",
      priority: "high",
      description: "Fire-rated doors in steel stud walls require special installation procedures",
      conditions: [
        { type: "section_selection", sectionId: 14, optionIds: [94] }, // Steel stud frame
        { type: "section_selection", sectionId: 8, optionIds: [60, 61, 62, 63, 64] }, // Any fire rating
      ],
      actions: [
        {
          type: "suggest",
          message:
            "Fire-rated doors in steel stud walls require fire-rated insulation and proper sealing. Professional installation is strongly recommended.",
          severity: "info",
        },
      ],
    },
    {
      id: "exterior_weatherproofing_requirements",
      name: "Exterior Door Weatherproofing Requirements",
      category: "installation",
      priority: "medium",
      description: "Exterior doors require proper weatherproofing and drainage",
      conditions: [{ type: "section_selection", sectionId: 7, optionIds: [84] }], // Exterior application
      actions: [
        {
          type: "suggest",
          message:
            "Exterior doors require weatherstripping, proper flashing, and drainage considerations. Consider adding weatherproofing accessories.",
          severity: "info",
          suggestedOptions: [109, 110], // Weatherstripping and door sweep
        },
      ],
    },

    // Safety Compliance Rules
    {
      id: "double_door_egress_requirements",
      name: "Double Door Egress Requirements",
      category: "safety",
      priority: "high",
      description: "Double doors used for egress must meet specific requirements",
      conditions: [
        { type: "section_selection", sectionId: 2, optionIds: [47] }, // Double door
        { type: "section_selection", sectionId: 7, optionIds: [84] }, // Exterior (egress)
      ],
      actions: [
        {
          type: "suggest",
          message:
            "Double doors used for egress should have panic hardware and proper coordination. Ensure compliance with local egress codes.",
          severity: "info",
        },
      ],
    },
    {
      id: "louver_fire_rating_restriction",
      name: "Louver Fire Rating Restrictions",
      category: "safety",
      priority: "high",
      description: "Fire-rated doors have restrictions on louver sizes and types",
      conditions: [
        { type: "section_selection", sectionId: 8, optionIds: [62, 63, 64] }, // 60+ minute fire rating
        { type: "section_selection", sectionId: 13, optionIds: [78, 79] }, // Large louvers
      ],
      actions: [
        {
          type: "warn",
          message:
            "Large louvers may not be compatible with high fire ratings. Verify louver fire rating matches door requirements.",
          severity: "warning",
        },
      ],
    },

    // Pricing Rules
    {
      id: "custom_size_pricing",
      name: "Custom Size Pricing Adjustment",
      category: "pricing",
      priority: "low",
      description: "Custom sizes incur additional manufacturing costs",
      conditions: [{ type: "custom_input", sectionId: 4 }], // Custom height input
      actions: [
        {
          type: "price_adjustment",
          message: "Custom size surcharge",
          severity: "info",
          priceAdjustment: 150,
        },
      ],
    },
    {
      id: "fire_rating_pricing",
      name: "Fire Rating Pricing Adjustment",
      category: "pricing",
      priority: "low",
      description: "Fire-rated doors have premium pricing",
      conditions: [{ type: "section_selection", sectionId: 8, optionIds: [60, 61, 62, 63, 64] }],
      actions: [
        {
          type: "price_adjustment",
          message: "Fire rating premium",
          severity: "info",
          priceAdjustment: 200,
        },
      ],
    },
  ]

  /**
   * Evaluates all business rules against current configuration
   */
  static evaluateCompliance(
    sections: ConfigurationSection[],
    selections: Record<number, QuoteSelection>,
  ): ComplianceResult {
    const result: ComplianceResult = {
      isCompliant: true,
      requiresApproval: false,
      blockedRules: [],
      warningRules: [],
      suggestions: [],
      priceAdjustments: [],
      messages: [],
    }

    for (const rule of this.rules) {
      if (this.evaluateRuleConditions(rule.conditions, sections, selections)) {
        // Rule conditions are met, execute actions
        for (const action of rule.actions) {
          switch (action.type) {
            case "block":
              result.isCompliant = false
              result.blockedRules.push(rule)
              result.messages.push({
                type: "error",
                title: rule.name,
                message: action.message,
                section: rule.category.replace("_", " "),
              })
              break

            case "warn":
              result.warningRules.push(rule)
              result.messages.push({
                type: "warning",
                title: rule.name,
                message: action.message,
                section: rule.category.replace("_", " "),
                affectedOptions: action.suggestedOptions
                  ? this.getOptionLabels(action.suggestedOptions, sections)
                  : undefined,
              })
              break

            case "suggest":
              result.suggestions.push(rule)
              result.messages.push({
                type: "info",
                title: rule.name,
                message: action.message,
                section: rule.category.replace("_", " "),
              })
              break

            case "price_adjustment":
              if (action.priceAdjustment) {
                result.priceAdjustments.push({
                  rule: rule.name,
                  amount: action.priceAdjustment,
                  description: action.message,
                })
              }
              break

            case "require_approval":
              result.requiresApproval = true
              result.messages.push({
                type: "warning",
                title: "Approval Required",
                message: action.message,
                section: rule.category.replace("_", " "),
              })
              break
          }
        }
      }
    }

    return result
  }

  /**
   * Evaluates if rule conditions are met
   */
  private static evaluateRuleConditions(
    conditions: RuleCondition[],
    sections: ConfigurationSection[],
    selections: Record<number, QuoteSelection>,
  ): boolean {
    return conditions.every((condition) => this.evaluateCondition(condition, sections, selections))
  }

  /**
   * Evaluates a single rule condition
   */
  private static evaluateCondition(
    condition: RuleCondition,
    sections: ConfigurationSection[],
    selections: Record<number, QuoteSelection>,
  ): boolean {
    switch (condition.type) {
      case "section_selection":
        if (!condition.sectionId || !condition.optionIds) return false
        const selection = selections[condition.sectionId]
        if (!selection) return false
        return condition.optionIds.some((optionId) => selection.optionIds.includes(optionId))

      case "custom_input":
        if (!condition.sectionId) return false
        const customSelection = selections[condition.sectionId]
        return !!(customSelection?.customValue && customSelection.customValue.trim())

      case "measurement":
        if (!condition.sectionId || !condition.operator || condition.value === undefined) return false
        const measurementSelection = selections[condition.sectionId]
        if (!measurementSelection) return false

        const section = sections.find((s) => s.id === condition.sectionId)
        if (!section) return false

        // Get numeric value from selection
        let numericValue: number
        if (measurementSelection.customValue) {
          numericValue = Number.parseFloat(measurementSelection.customValue)
        } else {
          const selectedOption = section.options.find((opt) => measurementSelection.optionIds.includes(opt.id))
          if (!selectedOption) return false
          numericValue = Number.parseFloat(selectedOption.value)
        }

        if (isNaN(numericValue)) return false

        // Apply operator
        switch (condition.operator) {
          case "equals":
            return numericValue === condition.value
          case "not_equals":
            return numericValue !== condition.value
          case "greater_than":
            return numericValue > condition.value
          case "less_than":
            return numericValue < condition.value
          case "in_range":
            return condition.range && numericValue >= condition.range[0] && numericValue <= condition.range[1]
          default:
            return false
        }

      case "combination":
        // For complex multi-condition rules (implement as needed)
        return true

      default:
        return false
    }
  }

  /**
   * Gets option labels for display
   */
  private static getOptionLabels(optionIds: number[], sections: ConfigurationSection[]): string[] {
    const labels: string[] = []
    for (const section of sections) {
      for (const option of section.options) {
        if (optionIds.includes(option.id)) {
          labels.push(option.label)
        }
      }
    }
    return labels
  }

  /**
   * Gets compliance summary for display
   */
  static getComplianceSummary(complianceResult: ComplianceResult): {
    status: "compliant" | "warnings" | "blocked"
    summary: string
    details: string[]
  } {
    if (!complianceResult.isCompliant) {
      return {
        status: "blocked",
        summary: `Configuration blocked by ${complianceResult.blockedRules.length} critical issue${
          complianceResult.blockedRules.length !== 1 ? "s" : ""
        }`,
        details: complianceResult.blockedRules.map((rule) => rule.name),
      }
    }

    if (complianceResult.warningRules.length > 0 || complianceResult.requiresApproval) {
      return {
        status: "warnings",
        summary: `Configuration has ${complianceResult.warningRules.length} warning${
          complianceResult.warningRules.length !== 1 ? "s" : ""
        }${complianceResult.requiresApproval ? " and requires approval" : ""}`,
        details: [
          ...complianceResult.warningRules.map((rule) => rule.name),
          ...(complianceResult.requiresApproval ? ["Requires engineering approval"] : []),
        ],
      }
    }

    return {
      status: "compliant",
      summary: "Configuration meets all compliance requirements",
      details: complianceResult.suggestions.map((rule) => rule.name),
    }
  }

  /**
   * Calculates total price adjustments
   */
  static calculatePriceAdjustments(complianceResult: ComplianceResult): {
    basePrice: number
    adjustments: { description: string; amount: number }[]
    totalAdjustment: number
    finalPrice: number
  } {
    const basePrice = 1200 // Base door price (would come from product data)
    const adjustments = complianceResult.priceAdjustments.map((adj) => ({
      description: adj.description,
      amount: adj.amount,
    }))

    const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.amount, 0)
    const finalPrice = basePrice + totalAdjustment

    return {
      basePrice,
      adjustments,
      totalAdjustment,
      finalPrice,
    }
  }
}
