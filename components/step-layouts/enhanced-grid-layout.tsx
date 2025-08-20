"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MultiSelectOptionGroup } from "@/components/option-components/multi-select-option-group"
import { RadioGroupMultiSelect } from "@/components/option-components/radio-group-multi-select"
import { CustomInputOption } from "@/components/option-components/custom-input-option"
import { AlertCircle, Info } from "lucide-react"
import type { QuoteOption, ConfigurationSection } from "@/types/quote-builder"

interface EnhancedGridLayoutProps {
  section: ConfigurationSection
  options: QuoteOption[]
  selectedOptionIds: number[]
  currentSelection: any
  onOptionSelect: (option: QuoteOption) => void
  onCustomSubmit: (option: QuoteOption, value: string) => void
}

export function EnhancedGridLayout({
  section,
  options,
  selectedOptionIds,
  currentSelection,
  onOptionSelect,
  onCustomSubmit,
}: EnhancedGridLayoutProps) {
  const hasCustomInputs = options.some((opt) => opt.customInput)
  const isMultiSelect = section.type === "multiple"
  const columns = section.columns || (hasCustomInputs ? 2 : 3)

  const hasRadioGroups = section.radios && section.radios.length > 0
  const clearOptionId = section.clear

  // Handle multi-select clear all
  const handleClearAll = () => {
    const noneOption = clearOptionId
      ? options.find((opt) => opt.id === clearOptionId)
      : options.find((opt) => opt.value === "none")
    if (noneOption) {
      onOptionSelect(noneOption)
    }
  }

  // Handle multi-select toggle
  const handleOptionToggle = (option: QuoteOption) => {
    if (option.value === "none" || option.id === clearOptionId) {
      // Clear all other selections
      onOptionSelect(option)
    } else {
      // Toggle this option
      onOptionSelect(option)
    }
  }

  // Validation for custom inputs
  const validateCustomInput = (value: string, option: QuoteOption): string | null => {
    if (!value.trim()) return "This field is required"

    // Dimension validation
    if (option.label.toLowerCase().includes("dimension") || option.label.toLowerCase().includes("size")) {
      const dimensionRegex = /^\d+(\.\d+)?\s*['"x×]\s*\d+(\.\d+)?\s*['"]?$/i
      if (!dimensionRegex.test(value.trim())) {
        return 'Please enter dimensions in format: 24" x 36" or 24 x 36'
      }
    }

    // Numeric validation for measurements
    if (option.label.toLowerCase().includes("thickness") || option.label.toLowerCase().includes("height")) {
      const numericValue = Number.parseFloat(value)
      if (isNaN(numericValue) || numericValue <= 0) {
        return "Please enter a valid positive number"
      }
      if (numericValue > 1000) {
        return "Value seems too large. Please check your input."
      }
    }

    return null
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
        {section.description && <p className="text-muted-foreground">{section.description}</p>}

        <div className="flex items-center justify-center gap-2">
          {section.required && (
            <Badge variant="secondary" className="text-xs">
              Required
            </Badge>
          )}
          {isMultiSelect && (
            <Badge variant="outline" className="text-xs">
              Multiple Selection
            </Badge>
          )}
          {section.tooltip && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="w-3 h-3" />
              <span>{section.tooltip}</span>
            </div>
          )}
        </div>
      </div>

      {isMultiSelect && hasRadioGroups && (
        <RadioGroupMultiSelect
          options={options}
          selectedOptionIds={selectedOptionIds}
          onOptionToggle={handleOptionToggle}
          onClearAll={handleClearAll}
          title=""
          columns={columns}
          radioGroups={section.radios}
          clearOptionId={clearOptionId}
        />
      )}

      {/* Standard multi-select layout */}
      {isMultiSelect && !hasRadioGroups && (
        <MultiSelectOptionGroup
          options={options}
          selectedOptionIds={selectedOptionIds}
          onOptionToggle={handleOptionToggle}
          onClearAll={handleClearAll}
          title=""
          columns={columns}
        />
      )}

      {/* Single select with custom inputs */}
      {!isMultiSelect && hasCustomInputs && (
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(columns, 2)} gap-6`}>
          {options.map((option) => (
            <CustomInputOption
              key={option.id}
              option={option}
              isSelected={selectedOptionIds.includes(option.id)}
              currentValue={currentSelection?.customValue}
              onSelect={onOptionSelect}
              onSubmit={onCustomSubmit}
              inputLabel={section.customInputLabel}
              inputType={option.label.toLowerCase().includes("note") ? "textarea" : "text"}
              validation={(value) => validateCustomInput(value, option)}
            />
          ))}
        </div>
      )}

      {/* Standard single select grid */}
      {!isMultiSelect && !hasCustomInputs && (
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
          {options.map((option) => {
            const isSelected = selectedOptionIds.includes(option.id)

            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? "ring-2 ring-primary bg-primary/5 shadow-md" : "hover:bg-accent/50 hover:shadow-sm"
                }`}
                onClick={() => onOptionSelect(option)}
              >
                <CardContent className="p-6 text-center space-y-3">
                  {option.image && (
                    <div className="flex justify-center mb-3">
                      <div className="relative w-24 h-24 rounded overflow-hidden bg-muted/20">
                        <img
                          src={option.image || "/placeholder.svg"}
                          alt={option.label}
                          className="w-full h-full object-contain transition-opacity duration-200"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=96&width=96&query=" + encodeURIComponent(option.label)
                          }}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2">
                    <h3 className="font-semibold text-card-foreground">{option.label}</h3>
                    {option.isPopular && (
                      <Badge className="text-xs bg-primary text-primary-foreground">Most Popular</Badge>
                    )}
                  </div>

                  {option.description && <p className="text-sm text-muted-foreground">{option.description}</p>}

                  {option.warning && (
                    <div className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                      <div className="flex items-center gap-1 justify-center">
                        <AlertCircle className="w-3 h-3" />
                        <span className="font-medium">Warning</span>
                      </div>
                      <p className="mt-1">{option.warning}</p>
                    </div>
                  )}

                  {isSelected && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Selected
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Selection guidance */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          {isMultiSelect ? (
            <>
              <strong>Multiple Selection:</strong> Select all options that apply, or choose "None" to clear all
              selections.
            </>
          ) : (
            <>
              <strong>Single Selection:</strong> Please select one option to continue to the next step.
            </>
          )}
        </p>
        {section.required && (
          <p className="text-xs text-muted-foreground mt-1">This step is required to complete your quote.</p>
        )}
      </div>
    </div>
  )
}
