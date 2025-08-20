"use client"

import type React from "react"
import { createContext, useContext, useReducer, useMemo, useEffect } from "react"
import type { QuoteContextType, QuoteState, QuoteOption } from "@/types/quote-builder"
import { getTrudoorProductTypes } from "@/lib/trudoor-data"
import {
  evaluateTrudoorSectionConditions,
  getTrudoorVisibleOptions,
  validateTrudoorSelections,
} from "@/lib/conditional-logic"
import { ValidationEngine } from "@/lib/validation-engine"
import { BusinessRulesEngine } from "@/lib/business-rules-engine"
import { QuoteSessionManager } from "@/lib/quote-session-manager"

const initialState: QuoteState = {
  selectedProductType: null,
  currentStep: 0,
  selections: {},
  isValid: false,
  completedSteps: new Set(),
}

type QuoteAction =
  | { type: "SELECT_PRODUCT"; payload: number }
  | { type: "MAKE_SELECTION"; payload: { sectionId: number; optionIds: number[]; customValue?: string } }
  | { type: "GO_TO_STEP"; payload: number }
  | { type: "NEXT_STEP" }
  | { type: "PREVIOUS_STEP" }
  | { type: "RESET_QUOTE" }
  | { type: "LOAD_SESSION"; payload: QuoteState }

function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  switch (action.type) {
    case "SELECT_PRODUCT":
      return {
        ...initialState,
        selectedProductType: action.payload,
        currentStep: 0,
      }

    case "MAKE_SELECTION":
      const { sectionId, optionIds, customValue } = action.payload

      const newSelections = {
        ...state.selections,
        [sectionId]: {
          sectionId,
          optionIds: Array.isArray(optionIds) ? optionIds : [optionIds],
          customValue,
          timestamp: Date.now(), // Add timestamp for debugging
        },
      }

      const productTypes = getTrudoorProductTypes()
      const currentProduct = productTypes.find((p) => p.id === state.selectedProductType)

      const validatedSelections = currentProduct
        ? validateTrudoorSelections(currentProduct.sections, newSelections)
        : newSelections

      const newCompletedSteps = new Set([...state.completedSteps, state.currentStep])

      const visibleSectionsAfterSelection = currentProduct
        ? Object.entries(currentProduct.sections)
            .filter(([_, section]) => {
              if (!section.section_conditions) return true
              return evaluateTrudoorSectionConditions(section.section_conditions, validatedSelections)
            })
            .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b)) // Sort by section ID
        : []

      const shouldAutoAdvance = state.currentStep < visibleSectionsAfterSelection.length - 1
      const nextStep = shouldAutoAdvance ? state.currentStep + 1 : state.currentStep

      console.log("Selection made:", { sectionId, optionIds, customValue, newSelections, shouldAutoAdvance, nextStep })

      return {
        ...state,
        selections: validatedSelections,
        completedSteps: newCompletedSteps,
        currentStep: nextStep,
        isValid: validatedSelections && Object.keys(validatedSelections).length > 0,
      }

    case "GO_TO_STEP":
      return {
        ...state,
        currentStep: Math.max(0, action.payload),
      }

    case "NEXT_STEP":
      return {
        ...state,
        currentStep: state.currentStep + 1,
      }

    case "PREVIOUS_STEP":
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1),
      }

    case "LOAD_SESSION":
      return {
        ...action.payload,
        completedSteps: new Set(Array.isArray(action.payload.completedSteps) ? action.payload.completedSteps : []),
      }

    case "RESET_QUOTE":
      return initialState

    default:
      return state
  }
}

function convertTrudoorOptionsToArray(trudoorOptions: Record<string, any>): QuoteOption[] {
  if (!trudoorOptions || typeof trudoorOptions !== "object") {
    console.warn("Invalid trudoorOptions provided:", trudoorOptions)
    return []
  }

  return Object.entries(trudoorOptions).map(([key, option]) => {
    if (!option || typeof option !== "object") {
      console.warn("Invalid option data:", option)
      return {
        id: Number.parseInt(key),
        label: "Invalid Option",
        description: "",
        value: key,
        isPopular: false,
        customInput: false,
      }
    }

    return {
      id: option.product_id || Number.parseInt(key),
      label: option.name || "Unnamed Option",
      description: option.description || "",
      value: key,
      isPopular: option.is_most_popular === 1,
      customInput: option.requires_input === 1,
      tooltip: option.tooltip || "",
      primaryImage: option.primary_image || "",
      price: option.price || 0,
      warning: option.warning || "",
    }
  })
}

const QuoteContext = createContext<QuoteContextType | null>(null)

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quoteReducer, initialState)

  useEffect(() => {
    // Load saved session on mount
    const loadSession = async () => {
      const savedSession = await QuoteSessionManager.loadSession()
      if (savedSession) {
        dispatch({ type: "LOAD_SESSION", payload: savedSession })
      }
    }
    loadSession()
  }, [])

  useEffect(() => {
    if (state.selectedProductType) {
      QuoteSessionManager.saveSession(state)
    }
  }, [state])

  const productTypes = useMemo(() => getTrudoorProductTypes(), [])

  const currentProduct = useMemo(() => {
    if (!state.selectedProductType) return null
    return productTypes.find((p) => p.id === state.selectedProductType) || null
  }, [state.selectedProductType, productTypes])

  const visibleSections = useMemo(() => {
    if (!currentProduct) return []

    return Object.entries(currentProduct.sections)
      .filter(([_, section]) => {
        if (!section.section_conditions) return true
        return evaluateTrudoorSectionConditions(section.section_conditions, state.selections)
      })
      .map(([sectionId, section]) => ({ ...section, id: Number.parseInt(sectionId) }))
      .sort((a, b) => a.id - b.id)
  }, [currentProduct, state.selections])

  const currentSection = useMemo(() => {
    if (!visibleSections.length || state.currentStep >= visibleSections.length) return null
    const section = visibleSections[state.currentStep]

    if (!section) return null

    const visibleTrudoorOptions = getTrudoorVisibleOptions(section, state.selections)
    const visibleOptions = convertTrudoorOptionsToArray(visibleTrudoorOptions)

    return {
      id: section.id,
      title: section.title,
      tooltip: section.tooltip || "",
      type: section.multi_select ? "multi" : ("single" as const),
      required: true,
      options: visibleOptions,
      columns: section.columns || 2,
      radios: section.radios || {},
      clear: section.clear || {},
      currentSelection: state.selections[section.id] || null,
    }
  }, [visibleSections, state.currentStep, state.selections])

  const validationResult = useMemo(() => {
    if (!currentProduct || !visibleSections.length) {
      return {
        isValid: false,
        canProceed: false,
        messages: [],
        completeness: { isComplete: false, missingSections: [], completedSections: [] },
      }
    }

    return ValidationEngine.validateConfiguration(
      Object.values(currentProduct.sections),
      state.selections,
      visibleSections,
    )
  }, [currentProduct, visibleSections, state.selections])

  const complianceResult = useMemo(() => {
    if (!currentProduct || !visibleSections.length) {
      return {
        isCompliant: false,
        requiresApproval: false,
        blockedRules: [],
        warningRules: [],
        suggestions: [],
        priceAdjustments: [],
        messages: [],
      }
    }

    return BusinessRulesEngine.evaluateCompliance(Object.values(currentProduct.sections), state.selections)
  }, [currentProduct, visibleSections, state.selections])

  const selectProduct = (productId: number) => {
    dispatch({ type: "SELECT_PRODUCT", payload: productId })
  }

  const makeSelection = (sectionId: number, optionIds: number[], customValue?: string) => {
    console.log("Making selection:", { sectionId, optionIds, customValue })

    // Validate inputs - allow empty optionIds for clearing selections
    if (!sectionId || !Array.isArray(optionIds)) {
      console.error("Invalid selection parameters:", { sectionId, optionIds, customValue })
      return
    }

    dispatch({ type: "MAKE_SELECTION", payload: { sectionId, optionIds, customValue } })
  }

  const goToStep = (step: number) => {
    dispatch({ type: "GO_TO_STEP", payload: step })
  }

  const nextStep = () => {
    dispatch({ type: "NEXT_STEP" })
  }

  const previousStep = () => {
    dispatch({ type: "PREVIOUS_STEP" })
  }

  const resetQuote = () => {
    dispatch({ type: "RESET_QUOTE" })
    QuoteSessionManager.clearSession()
  }

  const getSummary = () => {
    if (!currentProduct) return []

    return Object.entries(state.selections).map(([sectionId, selection]) => {
      const section = currentProduct.sections[sectionId]
      if (!section) return { section: "Unknown", selection: "Unknown" }

      const selectedOptions = Object.values(section.options).filter((opt: any) =>
        selection.optionIds.includes(opt.product_id),
      )

      const selectionText =
        selectedOptions.length > 0
          ? selectedOptions.map((opt: any) => opt.name).join(", ")
          : selection.customValue || "No selection"

      return {
        section: section.title,
        selection: selectionText,
      }
    })
  }

  const contextValue: QuoteContextType = {
    state,
    productTypes,
    currentProduct,
    currentSection,
    visibleSections,
    validationResult,
    complianceResult, // Added compliance result to context
    selectProduct,
    makeSelection,
    goToStep,
    nextStep,
    previousStep,
    resetQuote,
    getSummary,
  }

  return <QuoteContext.Provider value={contextValue}>{children}</QuoteContext.Provider>
}

export function useQuote() {
  const context = useContext(QuoteContext)
  if (!context) {
    throw new Error("useQuote must be used within a QuoteProvider")
  }
  return context
}
