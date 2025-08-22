"use client"

import { useEffect, useState } from 'react'
import { useSupabaseQuote } from '../hooks/useSupabaseQuote.js'
import { OptionGrid } from './layouts/OptionGrid.jsx'
import { RadioGroup } from './layouts/RadioGroup.jsx'

// Simple UI components
function Card({ children, className = "" }) {
  return (
    <div className={`border rounded-lg shadow-sm bg-white ${className}`}>
      {children}
    </div>
  )
}

function Button({ children, onClick, disabled = false, variant = "primary", className = "" }) {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors"
  const variants = {
    primary: disabled 
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-blue-600 text-white hover:bg-blue-700",
    secondary: disabled
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300",
    outline: disabled
      ? "border border-gray-300 bg-white text-gray-400 cursor-not-allowed"
      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

// Product Selection Component
function ProductSelector({ productTypes, onSelect }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Select Your Product Type
          </h1>
          <p className="text-lg text-gray-600">
            Choose the type of door or hardware you need to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productTypes.map(product => (
            <Card
              key={product.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="p-6 text-center" onClick={() => onSelect(product.id)}>
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-24 h-24 mx-auto mb-4 object-cover rounded"
                />
                <h3 className="font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {product.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Progress Bar Component
function ProgressBar({ current, total, completeness }) {
  const percentage = total > 0 ? (current / total) * 100 : 0
  
  return (
    <div className="mb-6 mx-4 my-3 lg:my-0 lg:mx-0">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Step {current + 1} of {total}</span>
        <span>{Math.round(completeness.percentage)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Step Navigation Component
function StepNavigation({ quote, onSubmitQuote }) {
  return (
    <div className="flex justify-between items-center p-4 border-b bg-white">
      <Button
        onClick={quote.prevStep}
        disabled={!quote.canGoBack()}
        variant="outline"
        className="w-24 flex flex-col items-center"
      >
        <span>←</span>
        <span>Previous</span>
      </Button>

      <div className="text-center">
        <h2 className="font-semibold text-gray-900">
          {quote.currentProduct?.name}
        </h2>
        <Button
          onClick={() => quote.selectProduct(null)}
          variant="outline"
          className="text-xs mt-1"
        >
          Change Product
        </Button>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={quote.nextStep}
          disabled={!quote.canAdvance()}
          className="w-24 flex flex-col items-center"
        >
          <span>→</span>
          <span>Next</span>
        </Button>
        
        {quote.isComplete() && (
          <Button
            onClick={onSubmitQuote}
            variant="primary"
            className="bg-green-600 hover:bg-green-700"
          >
            Complete Quote
          </Button>
        )}
      </div>
    </div>
  )
}

// Quote Summary Sidebar
function QuoteSummary({ quote }) {
  const [isOpen, setIsOpen] = useState(false)
  const summary = quote.getSummary()
  
  return (
    <div className="lg:w-80 bg-white lg:border-l border-gray-200 lg:p-6">
      {/* Mobile accordion header */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4"
        >
          <h3 className="text-lg font-semibold text-gray-900">Quote Summary</h3>
          <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </div>
        </button>
      </div>
      
      {/* Desktop header */}
      <h3 className="hidden lg:block text-lg font-semibold text-gray-900 mb-4">Quote Summary</h3>
      
      {/* Collapsible content */}
      <div className={`lg:block ${isOpen ? 'block' : 'hidden'} lg:px-0 px-4`}>
        {/* Progress */}
        <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{quote.completeness.completed} of {quote.completeness.total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${quote.completeness.percentage}%` }}
          />
        </div>
      </div>

      {/* Selections */}
      <div className="space-y-3 mb-6">
        {summary.map((item, index) => (
          <div key={index} className="text-sm">
            <div className="font-medium text-gray-900">{item.section}</div>
            <div className="text-gray-600">{item.selection}</div>
          </div>
        ))}
      </div>

      {/* Pricing */}
      {quote.pricing && (
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-2">Pricing</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span>${quote.pricing.basePrice}</span>
            </div>
            {quote.pricing.adjustments > 0 && (
              <div className="flex justify-between">
                <span>Adjustments:</span>
                <span>+${quote.pricing.adjustments}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t pt-1">
              <span>Total:</span>
              <span>${quote.pricing.total}</span>
            </div>
          </div>
        </div>
      )}

        {/* Actions */}
        <div className="mt-6 space-y-2">
          <Button 
            onClick={() => {
              if (confirm('Are you sure you want to start over?')) {
                quote.resetQuote()
              }
            }}
            variant="outline" 
            className="w-full"
          >
            Start Over
          </Button>
        </div>
      </div>
    </div>
  )
}

// Quote Review Component
function QuoteReview({ quote, onFinishQuote, onAddAnother, onSaveForLater }) {
  const summary = quote.getSummary()
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Quote Review</h1>
        <div className="flex justify-center space-x-4">
          <Button onClick={onFinishQuote} className="bg-green-600 hover:bg-green-700">
            Finish Quote Request
          </Button>
          <Button onClick={onAddAnother} variant="outline">
            Add Another Product
          </Button>
          <Button onClick={onSaveForLater} variant="outline">
            Save for Later
          </Button>
        </div>
      </div>

      {/* Quote Summary */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{quote.currentProduct?.name}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {summary.map((item, index) => (
            <div key={index} className="border rounded p-4">
              <div className="font-medium text-gray-900 mb-1">{item.section}</div>
              <div className="text-gray-600">{item.selection}</div>
            </div>
          ))}
        </div>

        {/* Quantity and Notes */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-4">
            <label className="font-medium text-gray-900">QUANTITY:</label>
            <input
              type="number"
              defaultValue="1"
              min="1"
              className="border border-gray-300 rounded px-3 py-1 w-20"
            />
          </div>
          
          <div>
            <label className="block font-medium text-gray-900 mb-2">NOTES:</label>
            <textarea
              className="w-full border border-gray-300 rounded p-3 h-32"
              placeholder="Add any additional notes or specifications..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Quote Submission Form Component
function QuoteSubmissionForm({ quote, onSubmit, onBack }) {
  const [formData, setFormData] = useState({
    deliveryMethod: 'ship',
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    phone: '',
    notes: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Finish Quote Request</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Contact Information */}
        <div>
          <label className="block font-medium text-gray-900 mb-2">Company Name:</label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-900 mb-2">First Name:</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium text-gray-900 mb-2">Last Name:</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-900 mb-2">Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium text-gray-900 mb-2">Confirm Email:</label>
            <input
              type="email"
              value={formData.confirmEmail}
              onChange={(e) => setFormData({...formData, confirmEmail: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-gray-900 mb-2">Phone:</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-900 mb-2">Notes:</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="w-full border border-gray-300 rounded p-3 h-32"
            placeholder="Additional notes or requirements..."
          />
        </div>

        <div className="flex justify-center">
          <Button type="submit" className="bg-green-600 hover:bg-green-700 px-8">
            → Submit Quote Request
          </Button>
        </div>
      </form>
    </div>
  )
}

// Main Quote Builder Component
export function SimpleQuoteBuilder() {
  const quote = useSupabaseQuote()
  const [currentView, setCurrentView] = useState('builder') // 'builder', 'review', 'submission'
  
  // Auto-advance to review when quote is complete
  useEffect(() => {
    
    if (quote.isComplete() && currentView === 'builder') {
      console.log('Auto-advancing to review!')
      setCurrentView('review')
    }
  }, [quote.isComplete(), currentView, quote.completeness])
  
  // Iframe communication setup
  useEffect(() => {
    // Notify parent of height changes
    const notifyHeightChange = () => {
      if (window.parent !== window) {
        const height = document.documentElement.scrollHeight
        window.parent.postMessage({
          type: 'QUOTE_BUILDER_RESIZE',
          height: height
        }, '*')
      }
    }
    
    // Initial height notification
    notifyHeightChange()
    
    // Monitor for height changes
    const observer = new ResizeObserver(notifyHeightChange)
    observer.observe(document.documentElement)
    
    return () => observer.disconnect()
  }, [])
  
  // Submit quote function
  const submitQuote = async (formData = null) => {
    try {
      const quoteData = formData || {
        product: quote.currentProduct,
        selections: quote.getSummary(),
        pricing: quote.pricing,
        timestamp: new Date().toISOString()
      }
      
      // Submit to API route
      const response = await fetch('/api/submit-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit quote')
      }
      
      // Notify parent window if in iframe
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'QUOTE_SUBMITTED',
          data: quoteData
        }, '*')
      }
      
      // Show success message
      alert('Quote submitted successfully!')
      
    } catch (error) {
      console.error('Error submitting quote:', error)
      alert('Error submitting quote. Please try again.')
      throw error // Re-throw so calling function can handle it
    }
  }

  // Show loading state while initializing
  if (!quote.initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product types...</p>
        </div>
      </div>
    )
  }

  // Show product selector if no product is selected
  if (!quote.selectedProductType) {
    return (
      <ProductSelector 
        productTypes={quote.productTypes}
        onSelect={quote.selectProduct}
      />
    )
  }

  // Handle different views
  if (currentView === 'review') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="px-4 py-2 text-center">
            <span className="text-sm text-gray-600">Featuring Doors Made in the USA! 🇺🇸</span>
          </div>
        </header>
        <QuoteReview 
          quote={quote}
          onFinishQuote={() => setCurrentView('submission')}
          onAddAnother={() => {
            quote.selectProduct(null)
            setCurrentView('builder')
          }}
          onSaveForLater={() => {
            alert('Quote saved for later!')
            quote.resetQuote()
            setCurrentView('builder')
          }}
        />
      </div>
    )
  }

  if (currentView === 'submission') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="px-4 py-2 text-center">
            <span className="text-sm text-gray-600">Featuring Doors Made in the USA! 🇺🇸</span>
          </div>
        </header>
        <QuoteSubmissionForm 
          quote={quote}
          onSubmit={async (formData) => {
            try {
              // Combine quote data with form data
              const submissionData = {
                product: quote.currentProduct,
                selections: quote.getSummary(),
                pricing: quote.pricing,
                timestamp: new Date().toISOString(),
                ...formData
              }
              await submitQuote(submissionData)
              // Only reset on successful submission
              setCurrentView('builder')
              quote.resetQuote()
            } catch (error) {
              // Don't reset quote on error - user can retry
              console.error('Quote submission failed:', error)
              alert('Failed to submit quote. Please try again.')
            }
          }}
          onBack={() => setCurrentView('review')}
        />
      </div>
    )
  }

  // Show configuration interface (builder view)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-4 py-2 text-center">
          <span className="text-sm text-gray-600">Featuring Doors Made in the USA! 🇺🇸</span>
        </div>
      </header>

      {/* Debug Info (temporary) */}
      <div className="bg-yellow-100 p-4 border-b text-sm">
        <strong>Debug:</strong> Complete: {quote.isComplete() ? 'YES' : 'NO'} | 
        Sections: {quote.completeness?.completed}/{quote.completeness?.total} | 
        Step: {quote.currentStep + 1}/{quote.visibleSections?.length} |
        Current View: {currentView}
        <br />
        <strong>Section 21 Status:</strong> {
          quote.visibleSections?.find(s => s.id === 21) ? 
            (quote.selections[21] && quote.selections[21].length > 0 ? '✅ COMPLETED' : '⏳ VISIBLE BUT INCOMPLETE') 
            : '❌ HIDDEN'
        }
      </div>

      {/* Step Navigation */}
      <StepNavigation quote={quote} onSubmitQuote={submitQuote} />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Content Area */}
        <div className="flex-1">
          {quote.loading && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading section...</p>
              </div>
            </div>
          )}
          
          {!quote.loading && quote.currentSection && (
            <div className="max-w-4xl mx-auto">
              <ProgressBar 
                current={quote.currentStep}
                total={quote.visibleSections.length}
                completeness={quote.completeness}
              />
              
              {/* Choose layout based on section preferences */}
              {quote.currentSection.multi_select === 1 || quote.currentSection.columns > 2 ? (
                <OptionGrid 
                  section={quote.currentSection}
                  selections={quote.selections}
                  onSelect={quote.makeSelection}
                  productId={quote.selectedProductType}
                />
              ) : (
                <RadioGroup 
                  section={quote.currentSection}
                  selections={quote.selections}
                  onSelect={quote.makeSelection}
                  productId={quote.selectedProductType}
                />
              )}

              {/* Validation Messages */}
              {quote.validation.errors.length > 0 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800">Please fix these issues:</h4>
                  <ul className="mt-2 text-sm text-red-700">
                    {quote.validation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {!quote.loading && !quote.currentSection && quote.visibleSections.length === 0 && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center text-gray-600">
                <p>No sections available for this product configuration.</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <QuoteSummary quote={quote} />
      </div>
    </div>
  )
}