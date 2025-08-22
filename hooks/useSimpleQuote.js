"use client"

import { useState, useEffect, useCallback } from 'react'
import { getProductTypes, getSectionsForProduct } from '../lib/simple-config.js'
import { 
  validateSelections, 
  getNextStep, 
  getPrevStep,
  getVisibleSections,
  getQuoteCompleteness,
  calculatePrice,
  saveQuoteToStorage,
  loadQuoteFromStorage,
  clearQuoteFromStorage
} from '../lib/config-helpers.js'

export function useSimpleQuote() {
  // Core state - much simpler than the previous complex reducer
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
  const [visibleSections, setVisibleSections] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(true) // Simple config loads synchronously

  // Derived data
  const productTypes = getProductTypes()
  const currentProduct = productTypes.find(p => p.id === selectedProductType)
  const allSections = selectedProductType ? getSectionsForProduct(selectedProductType) : []
  const currentSection = visibleSections[currentStep] || null

  // Update visible sections when selections change
  const updateVisibleSections = useCallback(() => {
    if (!selectedProductType) {
      setVisibleSections([])
      return
    }
    
    setLoading(true)
    try {
      const sections = getVisibleSections(selectedProductType, selections)
      setVisibleSections(sections)
    } catch (error) {
      console.error('Error updating visible sections:', error)
      // Fallback to all sections if rules engine fails
      const fallbackSections = getSectionsForProduct(selectedProductType)
      setVisibleSections(fallbackSections)
    } finally {
      setLoading(false)
    }
  }, [selectedProductType, selections])

  // Update visible sections whenever selections change
  useEffect(() => {
    updateVisibleSections()
  }, [updateVisibleSections])
  
  // Validation and completeness
  const validation = validateSelections(visibleSections, selections)
  const completeness = getQuoteCompleteness(visibleSections, selections)
  const pricing = selectedProductType ? calculatePrice(selectedProductType, selections) : null

  // Actions - simple functions instead of complex dispatch
  const selectProduct = (productId) => {
    setSelectedProductType(productId)
    setCurrentStep(0)
    setSelections({})
  }

  const makeSelection = async (sectionId, optionIds, customValue = null) => {
    console.log("poop")
    const newSelections = {
      ...selections,
      [sectionId]: optionIds
    }
    
    // Store custom value if provided
    if (customValue) {
      newSelections[`${sectionId}_custom`] = customValue
    }
    
    setSelections(newSelections)
    
    // Auto-advance if this step is now complete and there are more steps
    const isStepComplete = optionIds.length > 0
    if (isStepComplete && currentStep < visibleSections.length - 1 && !currentSection?.multi_select) {
      try {
        const nextAvailableStep = getNextStep(currentStep, visibleSections, newSelections, selectedProductType)
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
    }
  }

  const nextStep = () => {
    try {
      const next = getNextStep(currentStep, visibleSections, selections, selectedProductType)
      setCurrentStep(next)
    } catch (error) {
      console.error('Error getting next step:', error)
    }
  }

  const prevStep = () => {
    try {
      const prev = getPrevStep(currentStep, visibleSections, selections, selectedProductType)
      setCurrentStep(prev)
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
        const section = allSections.find(s => s.id === parseInt(sectionId))
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
    validation,
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