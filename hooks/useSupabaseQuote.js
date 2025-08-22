"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Core state
  const [selectedProductType, setSelectedProductType] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState({})
  const [urlInitialized, setUrlInitialized] = useState(false)
  
  // Load from URL params or storage on mount
  useEffect(() => {
    const productFromUrl = searchParams.get('product')
    const stepFromUrl = searchParams.get('step')
    const selectionsFromUrl = searchParams.get('selections')
    
    if (productFromUrl || stepFromUrl || selectionsFromUrl) {
      // Load from URL
      if (productFromUrl) setSelectedProductType(parseInt(productFromUrl))
      if (stepFromUrl) setCurrentStep(parseInt(stepFromUrl))
      if (selectionsFromUrl) {
        try {
          setSelections(JSON.parse(decodeURIComponent(selectionsFromUrl)))
        } catch (e) {
          console.error('Error parsing selections from URL:', e)
        }
      }
    } else {
      // Load from storage
      const saved = loadQuoteFromStorage()
      if (saved) {
        setSelectedProductType(saved.selectedProductType)
        setCurrentStep(saved.currentStep || 0)
        setSelections(saved.selections || {})
      }
    }
    setUrlInitialized(true)
  }, [])

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      const params = new URLSearchParams(window.location.search)
      const productFromUrl = params.get('product')
      const stepFromUrl = params.get('step')
      const selectionsFromUrl = params.get('selections')
      
      if (productFromUrl) setSelectedProductType(parseInt(productFromUrl))
      if (stepFromUrl) setCurrentStep(parseInt(stepFromUrl))
      if (selectionsFromUrl) {
        try {
          setSelections(JSON.parse(decodeURIComponent(selectionsFromUrl)))
        } catch (e) {
          console.error('Error parsing selections from URL:', e)
        }
      }
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Update URL and save to storage whenever state changes
  useEffect(() => {
    if (!urlInitialized) return
    
    if (selectedProductType) {
      // Update URL
      const params = new URLSearchParams()
      params.set('product', selectedProductType.toString())
      params.set('step', currentStep.toString())
      if (Object.keys(selections).length > 0) {
        params.set('selections', encodeURIComponent(JSON.stringify(selections)))
      }
      
      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.pushState({}, '', newUrl)
      
      // Save to storage as backup
      saveQuoteToStorage({
        selectedProductType,
        currentStep,
        selections
      })
    }
  }, [selectedProductType, currentStep, selections, urlInitialized])

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
    console.log('Making selection:', sectionId, optionIds, customValue)
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
    
    // Auto-advance after user makes a selection (saves clicking "Next")
    // Don't auto-advance if it's a multi-select section
    if (!currentSection?.multi_select) {
      // Small delay so user sees their selection, then advance
      setTimeout(() => {
        // Check validation with the NEW selections before advancing
        const updatedValidation = validateCurrentSection(currentSection, newSelections)
        if (updatedValidation.isValid) {
          const advanceToNext = async () => {
            try {
              const nextAvailableStep = await getNextStep(currentStep, visibleSections, selections, selectedProductType)
              
                setCurrentStep(nextAvailableStep)
                window.scrollTo({ top: 0, behavior: 'smooth' })
                setValidationAttempted(false)
              
            } catch (error) {
              console.error('Error getting next step:', error)
            }
          }
          advanceToNext()
        }
      }, 300)
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
      console.log(validation);
      
      // Check if current section is valid before advancing
      if (!validation.isValid) {
        return // Don't advance if validation fails
      }
      
      const next = await getNextStep(currentStep, visibleSections, selections, selectedProductType)
      setCurrentStep(next)
      
      // Scroll to top when advancing to next step
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
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