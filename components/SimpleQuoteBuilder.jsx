"use client"

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
    <div className="mb-6">
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
function StepNavigation({ quote }) {
  return (
    <div className="flex justify-between items-center p-4 border-b bg-white">
      <Button
        onClick={quote.prevStep}
        disabled={!quote.canGoBack()}
        variant="outline"
      >
        ← Previous
      </Button>

      <div className="text-center">
        <h2 className="font-semibold text-gray-900">
          {quote.currentProduct?.name}
        </h2>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={quote.nextStep}
          disabled={!quote.canAdvance()}
        >
          Next →
        </Button>
        
        {quote.isComplete() && (
          <Button
            onClick={() => {
              // Here you would typically submit the quote
              alert('Quote Complete! In a real app, this would submit the quote.')
            }}
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
  const summary = quote.getSummary()
  
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Summary</h3>
      
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
  )
}

// Main Quote Builder Component
export function SimpleQuoteBuilder() {
  const quote = useSupabaseQuote()

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

  // Show configuration interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-4 py-2 text-center">
          <span className="text-sm text-gray-600">Featuring Doors Made in the USA! 🇺🇸</span>
        </div>
      </header>

      {/* Step Navigation */}
      <StepNavigation quote={quote} />

      {/* Main Content */}
      <div className="flex">
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