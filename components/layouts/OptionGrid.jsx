"use client"

import { useState, useEffect } from "react"
import { formatOptionsForDisplay } from "../../lib/supabase-config-helpers.js"

// Simple Card component (replacing complex UI library)
function Card({ children, className = "", onClick }) {
  return (
    <div 
      className={`border rounded-lg shadow-sm bg-white ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Simple Badge component
function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

// Simple Button component  
function Button({ children, onClick, disabled = false, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${
        disabled 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${className}`}
    >
      {children}
    </button>
  )
}

// Simple Input component
function Input({ value, onChange, placeholder, className = "" }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    />
  )
}

export function OptionGrid({ section, selections = {}, onSelect, productId }) {
  const [customValues, setCustomValues] = useState({})
  const [visibleOptions, setVisibleOptions] = useState([])
  const [loading, setLoading] = useState(false)
  
  if (!section) return null

  const currentSelection = selections[section.id] || []
  const isMultiSelect = section.multi_select === 1

  // Load visible options using rules engine
  useEffect(() => {
    const loadVisibleOptions = async () => {
      setLoading(true)
      try {
        const formattedOptions = await formatOptionsForDisplay(section, selections, productId)
        setVisibleOptions(formattedOptions)
      } catch (error) {
        console.error('Error loading visible options:', error)
        // Fallback to all options
        const fallbackOptions = Object.entries(section.options || {})
          .sort((a, b) => {
            const aIndex = section.order?.indexOf(parseInt(a[0])) ?? 999
            const bIndex = section.order?.indexOf(parseInt(b[0])) ?? 999
            return aIndex - bIndex
          })
          .map(([id, option]) => ({
            id: parseInt(id),
            name: option.name,
            description: option.description || '',
            tooltip: option.tooltip || '',
            image: option.primary_image || '/placeholder.svg',
            popular: option.is_most_popular === true,
            customInput: option.requires_input === true,
            selected: currentSelection.includes(parseInt(id))
          }))
        setVisibleOptions(fallbackOptions)
      } finally {
        setLoading(false)
      }
    }

    loadVisibleOptions()
  }, [section, selections, productId])

  const handleOptionClick = (optionId, option) => {
    if (option.customInput) {
      // For custom input options, just select them (input will appear)
      if (isMultiSelect) {
        const isSelected = currentSelection.includes(parseInt(optionId))
        const newSelection = isSelected 
          ? currentSelection.filter(id => id !== parseInt(optionId))
          : [...currentSelection, parseInt(optionId)]
        onSelect(section.id, newSelection)
      } else {
        onSelect(section.id, [parseInt(optionId)])
      }
    } else {
      // For regular options, handle selection based on multi-select
      const isSelected = currentSelection.includes(parseInt(optionId))
      
      if (isMultiSelect) {
        // Handle clear option logic
        if (section.clear && parseInt(optionId) === section.clear) {
          // Clear option selected - remove all others
          onSelect(section.id, [parseInt(optionId)])
        } else if (section.clear && currentSelection.includes(section.clear)) {
          // Selecting non-clear option when clear is selected - replace clear
          onSelect(section.id, [parseInt(optionId)])
        } else {
          // Normal multi-select toggle
          const newSelection = isSelected 
            ? currentSelection.filter(id => id !== parseInt(optionId))
            : [...currentSelection, parseInt(optionId)]
          onSelect(section.id, newSelection)
        }
      } else {
        // Single selection
        onSelect(section.id, [parseInt(optionId)])
      }
    }
  }

  const handleCustomSubmit = (optionId, value) => {
    if (value.trim()) {
      onSelect(section.id, [parseInt(optionId)], value.trim())
      setCustomValues({ ...customValues, [optionId]: '' })
    }
  }

  const getGridColumns = (columns) => {
    switch (columns) {
      case 2: return 'grid-cols-1 md:grid-cols-2'
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h2>
        {section.tooltip && (
          <p className="text-gray-600 text-sm">{section.tooltip}</p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading options...</span>
        </div>
      )}

      {/* Options Grid */}
      {!loading && visibleOptions.length > 0 && (
        <div className={`grid gap-4 ${getGridColumns(section.columns)}`}>
          {visibleOptions.map((option) => {
            const isSelected = option.selected
            const showCustomInput = option.customInput && isSelected

            return (
              <div key={option.id} className="space-y-3">
                <Card
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-blue-50 shadow-md' 
                      : 'hover:bg-gray-50 hover:shadow-md'
                  }`}
                  onClick={() => handleOptionClick(option.id, option)}
                >
                  <div className="p-4 text-center">
                    {/* Multi-select checkbox indicator */}
                    {isMultiSelect && (
                      <div className="flex justify-end mb-2">
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="text-white text-xs">✓</div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-center mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {option.name}
                      </h3>
                      {option.popular && (
                        <Badge className="ml-2 bg-green-100 text-green-800">Most Popular</Badge>
                      )}
                    </div>

                    {option.description && (
                      <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                    )}

                    {option.tooltip && (
                      <p className="text-xs text-gray-500 mb-3 italic">{option.tooltip}</p>
                    )}

                    {option.image && option.image !== '/placeholder.svg' && (
                      <img 
                        src={option.image} 
                        alt={option.name}
                        className="w-16 h-16 mx-auto mb-3 object-cover rounded"
                      />
                    )}

                  {option.customInput && !isSelected && (
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOptionClick(option.id, option)
                      }}
                      className="mt-2 bg-gray-600 hover:bg-gray-700"
                    >
                      Select & Customize
                    </Button>
                  )}

                  {isSelected && !option.customInput && (
                    <Badge className="mt-2 bg-green-100 text-green-800">
                      {isMultiSelect ? 'Selected' : 'Selected'}
                    </Badge>
                  )}
                </div>
              </Card>

              {/* Custom Input Field */}
              {showCustomInput && (
                <Card className="border-blue-200 bg-blue-50">
                  <div className="p-4 space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Enter custom value:
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={customValues[option.id] || ''}
                        onChange={(e) => setCustomValues({ 
                          ...customValues, 
                          [option.id]: e.target.value 
                        })}
                        placeholder="Enter value..."
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleCustomSubmit(option.id, customValues[option.id])}
                        disabled={!customValues[option.id]?.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )
        })}
        </div>
      )}

      {!loading && visibleOptions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No options available for this section.</p>
        </div>
      )}

      {/* Selection Status */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          {currentSelection.length > 0 ? (
            <span className="text-green-600 font-medium">
              ✓ {isMultiSelect && currentSelection.length > 1 
                ? `${currentSelection.length} selections made` 
                : 'Selection made'} - you can continue to the next step
            </span>
          ) : (
            <span className="text-amber-600 font-medium">
              Please make a selection to continue
            </span>
          )}
        </p>
      </div>
    </div>
  )
}