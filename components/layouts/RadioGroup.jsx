"use client"

import { useState } from "react"

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

export function RadioGroup({ section, selections = {}, onSelect, productId }) {
  const [customValues, setCustomValues] = useState({})
  
  if (!section) return null

  const currentSelection = selections[section.id] || []
  const selectedValue = currentSelection[0] // Radio groups are single-select
  
  // Use the same option formatting as OptionGrid for consistency
  const options = Object.entries(section.options || {})
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
      popular: option.is_most_popular === 1,
      customInput: option.requires_input === 1
    }))

  const handleOptionSelect = (optionId, option) => {
    if (option.customInput) {
      // For custom input options, just select them (input will appear)
      onSelect(section.id, [parseInt(optionId)])
    } else {
      // For regular options, single selection
      onSelect(section.id, [parseInt(optionId)])
    }
  }

  const handleCustomSubmit = (optionId, value) => {
    if (value.trim()) {
      onSelect(section.id, [parseInt(optionId)], value.trim())
      setCustomValues({ ...customValues, [optionId]: '' })
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

      {/* Radio Options */}
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedValue === option.id
          const showCustomInput = option.customInput && isSelected

          return (
            <div key={option.id} className="space-y-3">
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => !option.customInput && handleOptionSelect(option.id, option)}
              >
                <div className="flex items-center space-x-3">
                  {/* Radio Button */}
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>

                  {/* Option Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{option.name}</span>
                      {option.popular && (
                        <Badge className="bg-green-100 text-green-800">Most Popular</Badge>
                      )}
                    </div>
                    {option.description && (
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    )}
                    {option.tooltip && (
                      <p className="text-xs text-gray-500 mt-1 italic">{option.tooltip}</p>
                    )}
                  </div>

                  {/* Custom Input Button */}
                  {option.customInput && !isSelected && (
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOptionSelect(option.id, option)
                      }}
                      className="bg-gray-600 hover:bg-gray-700"
                    >
                      Customize
                    </Button>
                  )}
                </div>
              </div>

              {/* Custom Input Field */}
              {showCustomInput && (
                <div className="ml-7 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter custom value:
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={customValues[optionId] || ''}
                      onChange={(e) => setCustomValues({ 
                        ...customValues, 
                        [optionId]: e.target.value 
                      })}
                      placeholder="Enter value..."
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleCustomSubmit(optionId, customValues[optionId])}
                      disabled={!customValues[optionId]?.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {options.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No options available for this section.</p>
        </div>
      )}

      {/* Selection Status */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          {selectedValue ? (
            <span className="text-green-600 font-medium">
              ✓ Selection made - you can continue to the next step
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