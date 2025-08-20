import type { QuoteSelection, ConfigurationSection } from "@/types/quote-builder"
import type { ValidationMessage } from "@/components/validation/warning-display"

export interface ValidationResult {
  isValid: boolean
  canProceed: boolean
  messages: ValidationMessage[]
  completeness: {
    isComplete: boolean
    missingSections: string[]
    completedSections: string[]
  }
}

/**
 * Comprehensive validation engine for TRUDOOR configurations
 */
export class ValidationEngine {
  /**
   * Validates the entire configuration
   */
  static validateConfiguration(
    sections: ConfigurationSection[],
    selections: Record<number, QuoteSelection>,
    visibleSections: ConfigurationSection[],
  ): ValidationResult {
    const messages: ValidationMessage[] = []
    let canProceed = true

    // Check business rules
    const businessRuleMessages = this.validateBusinessRules(sections, selections)
    messages.push(...businessRuleMessages)

    // Check manufacturability constraints
    const manufacturingMessages = this.validateManufacturingConstraints(sections, selections)
    messages.push(...manufacturingMessages)

    // Check compliance requirements
    const complianceMessages = this.validateCompliance(sections, selections)
    messages.push(...complianceMessages)

    // Check configuration completeness
    const completeness = this.checkCompleteness(visibleSections, selections)

    // Check for blocking errors
    const hasBlockingErrors = messages.some((msg) => msg.type === "error")
    if (hasBlockingErrors) {
      canProceed = false
    }

    return {
      isValid: !hasBlockingErrors && completeness.isComplete,
      canProceed: canProceed && completeness.isComplete,
      messages,
      completeness,
    }
  }

  /**
   * Validates business rules and constraints
   */
  private static validateBusinessRules(
    sections: ConfigurationSection[],
    selections: Record<number, QuoteSelection>,
  ): ValidationMessage[] {
    const messages: ValidationMessage[] = []

    // Fire rating + wall construction validation
    const fireRatingSection = sections.find((s) => s.title.toLowerCase().includes("fire-rated"))
    const wallBuiltSection = sections.find((s) => s.title.toLowerCase().includes("wall been built"))

    if (fireRatingSection && wallBuiltSection) {
      const fireRating = selections[fireRatingSection.id]
      const wallBuilt = selections[wallBuiltSection.id]

      // 3-hour fire door + existing wall = error
      const threeHourOption = fireRatingSection.options.find((opt) => opt.value === "3hour")
      const wallBuiltOption = wallBuiltSection.options.find((opt) => opt.value === "wall-built")

      if (
        fireRating?.optionIds.includes(threeHourOption?.id || -1) &&
        wallBuilt?.optionIds.includes(wallBuiltOption?.id || -1)
      ) {
        messages.push({
          type: "error",
          title: "Invalid Configuration",
          message:
            "3-hour fire doors require special wall construction and cannot be installed in existing walls. The wall must be built around the frame.",
          section: "Fire Rating & Wall Construction",
          affectedOptions: ["3 Hour Fire Rating", "Wall Already Built"],
        })
      }
    }

    // Embossing + lite kit validation
    const embossingSection = sections.find((s) => s.title.toLowerCase().includes("embossed"))
    const liteKitSection = sections.find((s) => s.title.toLowerCase().includes("lite kit"))

    if (embossingSection && liteKitSection) {
      const embossing = selections[embossingSection.id]
      const liteKit = selections[liteKitSection.id]

      const hasEmbossing = embossing?.optionIds.some((id) => {
        const option = embossingSection.options.find((opt) => opt.id === id)
        return option && option.value !== "no"
      })

      const hasLiteKit = liteKit?.optionIds.some((id) => {
        const option = liteKitSection.options.find((opt) => opt.id === id)
        return option && option.value !== "no"
      })

      if (hasEmbossing && hasLiteKit) {
        messages.push({
          type: "error",
          title: "Incompatible Options",
          message: "Embossed doors cannot have lite kits. Please choose either embossing or a lite kit, not both.",
          section: "Door Features",
          affectedOptions: ["Embossing", "Lite Kit"],
        })
      }
    }

    return messages
  }

  /**
   * Validates manufacturing constraints
   */
  private static validateManufacturingConstraints(
    sections: ConfigurationSection[],
    selections: Record<number, QuoteSelection>,
  ): ValidationMessage[] {
    const messages: ValidationMessage[] = []

    // Door size + manufacturer compatibility
    const widthSection = sections.find((s) => s.title.toLowerCase().includes("width"))
    const heightSection = sections.find((s) => s.title.toLowerCase().includes("height"))
    const manufacturerSection = sections.find((s) => s.title.toLowerCase().includes("manufacturer"))

    if (widthSection && heightSection && manufacturerSection) {
      const width = selections[widthSection.id]
      const height = selections[heightSection.id]
      const manufacturer = selections[manufacturerSection.id]

      // Check for oversized doors
      const widthOption = width?.optionIds[0] ? widthSection.options.find((opt) => opt.id === width.optionIds[0]) : null
      const heightOption = height?.optionIds[0]
        ? heightSection.options.find((opt) => opt.id === height.optionIds[0])
        : null

      if (widthOption && heightOption) {
        const widthValue = Number.parseInt(widthOption.value) || 0
        const heightValue = Number.parseInt(heightOption.value) || 0

        // Warn about oversized doors
        if (widthValue >= 48 && heightValue >= 96) {
          messages.push({
            type: "warning",
            title: "Oversized Door",
            message:
              "This door size may require special manufacturing considerations and longer lead times. Please confirm availability.",
            section: "Door Dimensions",
            affectedOptions: [widthOption.label, heightOption.label],
          })
        }

        // Check manufacturer limitations
        if (heightValue >= 96) {
          messages.push({
            type: "warning",
            title: "Limited Manufacturer Options",
            message:
              "8-foot and taller doors have limited manufacturer availability. Some options may not be available.",
            section: "Manufacturing",
          })
        }
      }
    }

    return messages
  }

  /**
   * Validates compliance requirements
   */
  private static validateCompliance(
    sections: ConfigurationSection[],
    selections: Record<number, QuoteSelection>,
  ): ValidationMessage[] {
    const messages: ValidationMessage[] = []

    // ADA compliance checks
    const widthSection = sections.find((s) => s.title.toLowerCase().includes("width"))
    const applicationSection = sections.find((s) => s.title.toLowerCase().includes("interior or exterior"))

    if (widthSection && applicationSection) {
      const width = selections[widthSection.id]
      const application = selections[applicationSection.id]

      const widthOption = width?.optionIds[0] ? widthSection.options.find((opt) => opt.id === width.optionIds[0]) : null
      const isExterior = application?.optionIds.some((id) => {
        const option = applicationSection.options.find((opt) => opt.id === id)
        return option?.value === "exterior"
      })

      if (widthOption && isExterior) {
        const widthValue = Number.parseInt(widthOption.value) || 0
        if (widthValue < 32) {
          messages.push({
            type: "warning",
            title: "ADA Compliance Warning",
            message:
              "Exterior doors less than 32 inches wide may not meet ADA accessibility requirements. Consider a wider door for public access.",
            section: "Accessibility Compliance",
            affectedOptions: [widthOption.label, "Exterior Application"],
          })
        }
      }
    }

    // Fire rating compliance
    const fireRatingSection = sections.find((s) => s.title.toLowerCase().includes("fire-rated"))
    if (fireRatingSection) {
      const fireRating = selections[fireRatingSection.id]
      const hasFireRating = fireRating?.optionIds.some((id) => {
        const option = fireRatingSection.options.find((opt) => opt.id === id)
        return option && option.value !== "no"
      })

      if (hasFireRating) {
        messages.push({
          type: "info",
          title: "Fire Rating Requirements",
          message:
            "Fire-rated doors must be installed according to local building codes. Professional installation is recommended.",
          section: "Building Code Compliance",
        })
      }
    }

    return messages
  }

  /**
   * Checks configuration completeness
   */
  private static checkCompleteness(
    visibleSections: ConfigurationSection[],
    selections: Record<number, QuoteSelection>,
  ): ValidationResult["completeness"] {
    const missingSections: string[] = []
    const completedSections: string[] = []

    for (const section of visibleSections) {
      const hasSelection = selections[section.id] && selections[section.id].optionIds.length > 0

      if (section.required && !hasSelection) {
        missingSections.push(section.title)
      } else if (hasSelection) {
        completedSections.push(section.title)
      }
    }

    return {
      isComplete: missingSections.length === 0,
      missingSections,
      completedSections,
    }
  }

  /**
   * Validates a specific option selection
   */
  static validateOptionSelection(
    option: any,
    section: ConfigurationSection,
    allSelections: Record<number, QuoteSelection>,
  ): ValidationMessage[] {
    const messages: ValidationMessage[] = []

    // Check option-level warnings
    if (option.warning) {
      messages.push({
        type: "warning",
        title: "Option Warning",
        message: option.warning,
        section: section.title,
        affectedOptions: [option.label],
      })
    }

    // Check custom input validation
    if (option.customInput && allSelections[section.id]?.customValue) {
      const customValue = allSelections[section.id].customValue
      const validationResult = this.validateCustomInput(customValue, option, section)
      if (validationResult) {
        messages.push(validationResult)
      }
    }

    return messages
  }

  /**
   * Validates custom input values
   */
  private static validateCustomInput(
    value: string,
    option: any,
    section: ConfigurationSection,
  ): ValidationMessage | null {
    if (!value || !value.trim()) {
      return {
        type: "error",
        title: "Required Input",
        message: "This field requires a value to proceed.",
        section: section.title,
        affectedOptions: [option.label],
      }
    }

    // Dimension validation
    if (option.label.toLowerCase().includes("dimension") || section.title.toLowerCase().includes("size")) {
      const dimensionRegex = /^\d+(\.\d+)?\s*['"x×]\s*\d+(\.\d+)?\s*['"]?$/i
      if (!dimensionRegex.test(value.trim())) {
        return {
          type: "error",
          title: "Invalid Format",
          message: 'Please enter dimensions in format: 24" x 36" or 24 x 36',
          section: section.title,
          affectedOptions: [option.label],
        }
      }
    }

    // Numeric validation for measurements
    if (option.label.toLowerCase().includes("thickness") || option.label.toLowerCase().includes("height")) {
      const numericValue = Number.parseFloat(value)
      if (isNaN(numericValue) || numericValue <= 0) {
        return {
          type: "error",
          title: "Invalid Value",
          message: "Please enter a valid positive number.",
          section: section.title,
          affectedOptions: [option.label],
        }
      }
      if (numericValue > 1000) {
        return {
          type: "warning",
          title: "Unusual Value",
          message: "This value seems unusually large. Please verify it's correct.",
          section: section.title,
          affectedOptions: [option.label],
        }
      }
    }

    return null
  }
}
