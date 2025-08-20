// Enhanced conditional logic engine for TRUDOOR Quote Builder

import type {
  SectionCondition,
  OptionCondition,
  QuoteSelection,
  ConfigurationSection,
  TrudoorSectionCondition,
  TrudoorOptionCondition,
  TrudoorSection,
} from "@/types/quote-builder"

export function evaluateCondition(condition: SectionCondition, selections: Record<number, QuoteSelection>): boolean {
  const selection = selections[condition.section]
  if (!selection) return false

  const hasOption = selection.optionIds.some((id) => condition.options.includes(id))
  return condition.condition === "IN" ? hasOption : !hasOption
}

export function evaluateSectionConditions(
  sectionConditions: SectionCondition[][],
  selections: Record<number, QuoteSelection>,
): boolean {
  if (!sectionConditions || sectionConditions.length === 0) return true

  // OR logic between condition groups - if ANY group passes, section is visible
  return sectionConditions.some((conditionGroup) =>
    // AND logic within each condition group - ALL conditions must pass
    conditionGroup.every((condition) => evaluateCondition(condition, selections)),
  )
}

export function evaluateOptionConditions(
  optionConditions: OptionCondition[],
  selections: Record<number, QuoteSelection>,
): number[] {
  if (!optionConditions || optionConditions.length === 0) return []

  const visibleOptions = new Set<number>()

  // Process conditions in order - later conditions can override earlier ones
  for (const optionCondition of optionConditions) {
    const allParamsMatch = optionCondition.params.every((param) => evaluateCondition(param, selections))

    if (allParamsMatch) {
      // Add all options from this condition
      optionCondition.show.forEach((optionId) => visibleOptions.add(optionId))
    }
  }

  return Array.from(visibleOptions)
}

export function getVisibleOptions(section: ConfigurationSection, selections: Record<number, QuoteSelection>) {
  if (!section.optionConditions || section.optionConditions.length === 0) {
    return section.options
  }

  const visibleOptionIds = evaluateOptionConditions(section.optionConditions, selections)

  // If no conditions match, show all options (fallback behavior)
  if (visibleOptionIds.length === 0) {
    return section.options
  }

  return section.options.filter((option) => visibleOptionIds.includes(option.id))
}

export function validateSelections(
  sections: ConfigurationSection[],
  selections: Record<number, QuoteSelection>,
): Record<number, QuoteSelection> {
  const validatedSelections: Record<number, QuoteSelection> = {}
  const processedSections = new Set<number>()

  // Process sections in dependency order to handle cascading changes
  const sortedSections = topologicalSort(sections)

  for (const section of sortedSections) {
    const sectionId = section.id
    const selection = selections[sectionId]

    if (!selection) continue

    // Check if section is still visible with current validated selections
    const currentSelections = { ...validatedSelections, ...selections }
    if (!evaluateSectionConditions(section.sectionConditions || [], currentSelections)) {
      // Section is no longer visible, skip it
      continue
    }

    // Check if selected options are still valid
    const visibleOptions = getVisibleOptions(section, currentSelections)
    const validOptionIds = selection.optionIds.filter((optionId) => visibleOptions.some((opt) => opt.id === optionId))

    // Keep selection only if it has valid options
    if (validOptionIds.length > 0) {
      validatedSelections[sectionId] = {
        ...selection,
        optionIds: validOptionIds,
      }
    }

    processedSections.add(sectionId)
  }

  return validatedSelections
}

function topologicalSort(sections: ConfigurationSection[]): ConfigurationSection[] {
  const visited = new Set<number>()
  const result: ConfigurationSection[] = []
  const temp = new Set<number>()

  function visit(section: ConfigurationSection) {
    if (temp.has(section.id)) {
      // Circular dependency detected, but continue processing
      return
    }
    if (visited.has(section.id)) return

    temp.add(section.id)

    // Visit dependencies first
    const dependencies = getSectionDependencies(section)
    for (const depId of dependencies) {
      const depSection = sections.find((s) => s.id === depId)
      if (depSection) {
        visit(depSection)
      }
    }

    temp.delete(section.id)
    visited.add(section.id)
    result.push(section)
  }

  for (const section of sections) {
    if (!visited.has(section.id)) {
      visit(section)
    }
  }

  return result
}

export function getSectionDependencies(section: ConfigurationSection): number[] {
  const dependencies = new Set<number>()

  // Dependencies from section conditions
  if (section.sectionConditions) {
    for (const conditionGroup of section.sectionConditions) {
      for (const condition of conditionGroup) {
        dependencies.add(condition.section)
      }
    }
  }

  // Dependencies from option conditions
  if (section.optionConditions) {
    for (const optionCondition of section.optionConditions) {
      for (const param of optionCondition.params) {
        dependencies.add(param.section)
      }
    }
  }

  return Array.from(dependencies)
}

export function detectCircularDependencies(sections: ConfigurationSection[]): string[] {
  const errors: string[] = []
  const visited = new Set<number>()
  const recursionStack = new Set<number>()

  function dfs(sectionId: number, path: number[]): void {
    if (recursionStack.has(sectionId)) {
      const cycle = [...path, sectionId]
      const cycleStart = cycle.indexOf(sectionId)
      const circularPath = cycle.slice(cycleStart)
      errors.push(`Circular dependency: ${circularPath.join(" → ")}`)
      return
    }

    if (visited.has(sectionId)) return

    visited.add(sectionId)
    recursionStack.add(sectionId)

    const section = sections.find((s) => s.id === sectionId)
    if (section) {
      const dependencies = getSectionDependencies(section)
      for (const depId of dependencies) {
        dfs(depId, [...path, sectionId])
      }
    }

    recursionStack.delete(sectionId)
  }

  for (const section of sections) {
    if (!visited.has(section.id)) {
      dfs(section.id, [])
    }
  }

  return errors
}

export function evaluateTrudoorCondition(
  condition: TrudoorSectionCondition,
  selections: Record<number, QuoteSelection>,
): boolean {
  const selection = selections[condition.section]
  if (!selection) return false

  const hasOption = selection.optionIds.some((id) => condition.options.includes(id))
  return condition.condition === "IN" ? hasOption : !hasOption
}

export function evaluateTrudoorSectionConditions(
  sectionConditions: TrudoorSectionCondition[][],
  selections: Record<number, QuoteSelection>,
): boolean {
  if (!sectionConditions || sectionConditions.length === 0) return true

  return sectionConditions.some((conditionGroup) =>
    conditionGroup.every((condition) => evaluateTrudoorCondition(condition, selections)),
  )
}

export function evaluateTrudoorOptionConditions(
  optionConditions: TrudoorOptionCondition[],
  selections: Record<number, QuoteSelection>,
): number[] {
  if (!optionConditions || optionConditions.length === 0) return []

  const visibleOptions = new Set<number>()

  for (const optionCondition of optionConditions) {
    const allParamsMatch = optionCondition.params.every((param) => evaluateTrudoorCondition(param, selections))

    if (allParamsMatch) {
      optionCondition.show.forEach((optionId) => visibleOptions.add(optionId))
    }
  }

  return Array.from(visibleOptions)
}

export function getTrudoorVisibleOptions(
  section: TrudoorSection,
  selections: Record<number, QuoteSelection>,
): Record<string, any> {
  if (!section.option_conditions || section.option_conditions.length === 0) {
    return section.options
  }

  const visibleOptionIds = evaluateTrudoorOptionConditions(section.option_conditions, selections)

  if (visibleOptionIds.length === 0) {
    return section.options
  }

  const visibleOptions: Record<string, any> = {}
  Object.entries(section.options).forEach(([key, option]) => {
    if (visibleOptionIds.includes(option.product_id)) {
      visibleOptions[key] = option
    }
  })

  return visibleOptions
}

export function validateTrudoorSelections(
  sections: Record<string, TrudoorSection>,
  selections: Record<number, QuoteSelection>,
): Record<number, QuoteSelection> {
  const validatedSelections: Record<number, QuoteSelection> = {}

  for (const [sectionId, selection] of Object.entries(selections)) {
    const section = sections[sectionId]
    if (!section) continue

    // Check if section is still visible
    if (!evaluateTrudoorSectionConditions(section.section_conditions || [], selections)) {
      continue
    }

    // Check if selected options are still valid
    const visibleOptions = getTrudoorVisibleOptions(section, selections)
    const visibleOptionIds = Object.values(visibleOptions).map((opt: any) => opt.product_id)
    const validOptionIds = selection.optionIds.filter((optionId) => visibleOptionIds.includes(optionId))

    if (validOptionIds.length > 0) {
      validatedSelections[Number.parseInt(sectionId)] = {
        ...selection,
        optionIds: validOptionIds,
      }
    }
  }

  return validatedSelections
}

export function validateBusinessRules(
  sections: ConfigurationSection[],
  selections: Record<number, QuoteSelection>,
): { isValid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = []
  const errors: string[] = []

  // Check for manufacturability constraints
  for (const section of sections) {
    const selection = selections[section.id]
    if (!selection) continue

    // Check each selected option for warnings
    for (const optionId of selection.optionIds) {
      const option = section.options.find((opt) => opt.id === optionId)
      if (option?.warning) {
        warnings.push(`${section.title}: ${option.warning}`)
      }
    }
  }

  // Check for compliance issues (fire rating + wall construction)
  const fireRatingSelection = selections[8] // Fire rating section
  const wallBuiltSelection = selections[15] // Wall built section

  if (fireRatingSelection?.optionIds.includes(64) && wallBuiltSelection?.optionIds.includes(97)) {
    errors.push("3-hour fire doors require special wall construction and cannot be installed in existing walls")
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  }
}

export function checkConfigurationCompleteness(
  sections: ConfigurationSection[],
  selections: Record<number, QuoteSelection>,
): { isComplete: boolean; missingSections: string[] } {
  const missingSections: string[] = []

  for (const section of sections) {
    // Check if section is visible
    if (!evaluateSectionConditions(section.sectionConditions || [], selections)) {
      continue
    }

    // Check if required section has selection
    if (section.required && !selections[section.id]) {
      missingSections.push(section.title)
    }
  }

  return {
    isComplete: missingSections.length === 0,
    missingSections,
  }
}
