"use client"

import { useState, useEffect, useCallback } from 'react'
import { getProductTypes, getSectionsForProduct } from '../lib/supabase-config.js'
import { 
  validateCurrentSection,
  getNextStep, 
  getPrevStep,
  getVisibleSections,
  getQuoteCompleteness,
  calculatePrice,
  saveQuoteToStorage,
  loadQuoteFromStorage,
  clearQuoteFromStorage
} from '../lib/supabase-config-helpers.js'

export function useSupabaseQuote() {
  // Core state
  const [selectedProductType, setSelectedProductType] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState({})
  
  // Load from storage on mount
  useEffect(() => {
    const saved = loadQuoteFromStorage()
    if (saved) {
      setSelectedProductType(saved.selectedProductType)
      setCurrentStep(saved.currentStep || 0)
      setSelections(saved.selections || {})
    }
  }, [])

  // Save to storage whenever state changes
  useEffect(() => {
    if (selectedProductType) {
      saveQuoteToStorage({
        selectedProductType,
        currentStep,
        selections
      })
    }
  }, [selectedProductType, currentStep, selections])

  // Additional state for async data
  const [productTypes, setProductTypes] = useState([])
  const [visibleSections, setVisibleSections] = useState([])
  const [allSections, setAllSections] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [validationAttempted, setValidationAttempted] = useState(false)

  // Load product types on mount
  useEffect(() => {
    const loadProductTypes = async () => {
      try {
        const types = await getProductTypes()
        setProductTypes(types)
        setInitialized(true)
      } catch (error) {
        console.error('Error loading product types:', error)
        setInitialized(true)
      }
    }
    
    loadProductTypes()
  }, [])

  // Derived data
  const currentProduct = productTypes.find(p => p.id === selectedProductType)
  const currentSection = visibleSections[currentStep] || null

  // Update sections when product changes
  useEffect(() => {
    const loadSections = async () => {
      if (!selectedProductType) {
        setAllSections([])
        return
      }
      
      try {
        const sections = await getSectionsForProduct(selectedProductType)
        setAllSections(sections)
      } catch (error) {
        console.error('Error loading sections:', error)
      }
    }
    
    loadSections()
  }, [selectedProductType])

  // Update visible sections when selections change
  const updateVisibleSections = useCallback(async () => {
    if (!selectedProductType) {
      setVisibleSections([])
      return
    }
    
    setLoading(true)
    try {
      const sections = await getVisibleSections(selectedProductType, selections)
      setVisibleSections(sections)
    } catch (error) {
      console.error('Error updating visible sections:', error)
      // Fallback to all sections if rules engine fails
      setVisibleSections(allSections)
    } finally {
      setLoading(false)
    }
  }, [selectedProductType, selections, allSections])

  // Update visible sections whenever selections change
  useEffect(() => {
    updateVisibleSections()
  }, [updateVisibleSections])
  
  // Validation and completeness
  const validation = validateCurrentSection(currentSection, selections)
  const completeness = getQuoteCompleteness(visibleSections, selections)
  const pricing = selectedProductType ? calculatePrice(selectedProductType, selections) : null
  
  // Only show validation errors if validation has been attempted
  const displayValidation = {
    ...validation,
    errors: validationAttempted ? validation.errors : []
  }

  // Actions
  const selectProduct = (productId) => {
    setSelectedProductType(productId)
    setCurrentStep(0)
    setSelections({})
    setValidationAttempted(false) // Reset validation when selecting product
  }

  const makeSelection = async (sectionId, optionIds, customValue = null) => {
    const newSelections = {
      ...selections,
      [sectionId]: optionIds
    }
    
    // Store custom value if provided
    if (customValue) {
      newSelections[`${sectionId}_custom`] = customValue
    }
    
    setSelections(newSelections)
    
    // Reset validation attempted when user makes a selection
    setValidationAttempted(false)
    
    // Auto-advance if this step is now complete and there are more steps
    const isStepComplete = optionIds.length > 0
    if (isStepComplete && currentStep < visibleSections.length - 1 && !currentSection?.multi_select) {
      try {
        const nextAvailableStep = await getNextStep(currentStep, visibleSections, newSelections, selectedProductType)
        if (nextAvailableStep > currentStep) {
          setCurrentStep(nextAvailableStep)
        }
      } catch (error) {
        console.error('Error getting next step:', error)
      }
    }
  }

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < visibleSections.length) {
      setCurrentStep(stepIndex)
      setValidationAttempted(false) // Reset validation when navigating
    }
  }

  const nextStep = async () => {
    try {
      // Always mark validation as attempted when user tries to advance
      setValidationAttempted(true)
      
      // Check if current section is valid before advancing
      if (!validation.isValid) {
        return // Don't advance if validation fails
      }
      
      const next = await getNextStep(currentStep, visibleSections, selections, selectedProductType)
      setCurrentStep(next)
      
      // Reset validation attempted for next step
      setValidationAttempted(false)
    } catch (error) {
      console.error('Error getting next step:', error)
    }
  }

  const prevStep = async () => {
    try {
      const prev = await getPrevStep(currentStep, visibleSections, selections, selectedProductType)
      setCurrentStep(prev)
      setValidationAttempted(false) // Reset validation when going back
    } catch (error) {
      console.error('Error getting previous step:', error)
    }
  }

  const resetQuote = () => {
    setSelectedProductType(null)
    setCurrentStep(0)
    setSelections({})
    clearQuoteFromStorage()
  }

  const canAdvance = () => {
    if (!currentSection) return false
    
    const selection = selections[currentSection.id]
    return selection && selection.length > 0
  }

  const canGoBack = () => {
    return currentStep > 0
  }

  const isComplete = () => {
    return completeness.isComplete
  }

  const getSummary = () => {
    return Object.entries(selections)
      .filter(([key]) => !key.includes('_custom')) // Filter out custom value keys
      .map(([sectionId, optionIds]) => {
        const section = visibleSections.find(s => s.id === parseInt(sectionId))
        if (!section) return null
        
        const optionNames = optionIds.map(optionId => {
          const option = section.options[optionId]
          return option ? option.name : `Option ${optionId}`
        })
        
        // Add custom value if present
        const customValue = selections[`${sectionId}_custom`]
        const displayValue = customValue ? `${optionNames.join(', ')} (${customValue})` : optionNames.join(', ')
        
        return {
          section: section.title,
          selection: displayValue
        }
      })
      .filter(Boolean)
  }

  return {
    // State
    selectedProductType,
    currentStep,
    selections,
    loading,
    initialized,
    
    // Derived data
    productTypes,
    currentProduct,
    allSections,
    visibleSections,
    currentSection,
    
    // Validation & status
    validation: displayValidation,
    completeness,
    pricing,
    
    // Actions
    selectProduct,
    makeSelection,
    goToStep,
    nextStep,
    prevStep,
    resetQuote,
    
    // Helpers
    canAdvance,
    canGoBack,
    isComplete,
    getSummary
  }
}