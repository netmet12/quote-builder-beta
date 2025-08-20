"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Circle } from "lucide-react"
import type { QuoteOption } from "@/types/quote-builder"

interface RadioGroup {
  title: string
  options: number[]
  allow_multi?: boolean
}

interface RadioGroupMultiSelectProps {
  options: QuoteOption[]
  selectedOptionIds: number[]
  onOptionToggle: (option: QuoteOption) => void
  onClearAll: () => void
  title: string
  description?: string
  columns?: number
  radioGroups?: RadioGroup[]
  clearOptionId?: number
}

export function RadioGroupMultiSelect({
  options,
  selectedOptionIds,
  onOptionToggle,
  onClearAll,
  title,
  description,
  columns = 2,
  radioGroups = [],
  clearOptionId,
}: RadioGroupMultiSelectProps) {
  const hasSelections = selectedOptionIds.length > 0
  const clearOption = clearOptionId ? options.find((opt) => opt.id === clearOptionId) : null

  // Get options that are not in any radio group (ungrouped options)
  const groupedOptionIds = new Set(radioGroups.flatMap((group) => group.options))
  const ungroupedOptions = options.filter((opt) => opt.id !== clearOptionId && !groupedOptionIds.has(opt.id))

  // Handle option selection with radio group logic
  const handleOptionSelect = (option: QuoteOption) => {
    // Find which radio group this option belongs to
    const radioGroup = radioGroups.find((group) => group.options.includes(option.id))

    if (radioGroup && !radioGroup.allow_multi) {
      // Radio group behavior - deselect other options in the same group
      const otherGroupOptions = radioGroup.options.filter((id) => id !== option.id)
      const hasOtherSelected = otherGroupOptions.some((id) => selectedOptionIds.includes(id))

      if (hasOtherSelected) {
        // Deselect other options in this radio group first
        otherGroupOptions.forEach((id) => {
          const otherOption = options.find((opt) => opt.id === id)
          if (otherOption && selectedOptionIds.includes(id)) {
            onOptionToggle(otherOption)
          }
        })
      }
    }

    // Toggle the selected option
    onOptionToggle(option)
  }

  // Check if an option is selected
  const isOptionSelected = (optionId: number) => selectedOptionIds.includes(optionId)

  // Render a group of options
  const renderOptionGroup = (groupOptions: QuoteOption[], groupTitle?: string, allowMulti = false) => (
    <div className="space-y-3">
      {groupTitle && (
        <div className="border-b border-muted pb-2">
          <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
            {groupTitle}
            {!allowMulti && (
              <Badge variant="outline" className="text-xs">
                Single Selection
              </Badge>
            )}
            {allowMulti && (
              <Badge variant="secondary" className="text-xs">
                Multiple Selection
              </Badge>
            )}
          </h4>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(columns, groupOptions.length)} gap-3`}>
        {groupOptions.map((option) => {
          const isSelected = isOptionSelected(option.id)
          const radioGroup = radioGroups.find((group) => group.options.includes(option.id))
          const isRadioGroup = radioGroup && !radioGroup.allow_multi

          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? "ring-2 ring-primary bg-primary/5 shadow-md" : "hover:bg-accent/50 hover:shadow-sm"
              }`}
              onClick={() => handleOptionSelect(option)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {/* Selection indicator - radio or checkbox */}
                  <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                    {isRadioGroup ? (
                      // Radio button for single-select groups
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-colors ${
                          isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white m-0.5" />}
                      </div>
                    ) : (
                      // Checkbox for multi-select groups
                      <div
                        className={`w-4 h-4 rounded border-2 transition-colors ${
                          isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-sm text-card-foreground">{option.label}</h5>
                      {option.isPopular && (
                        <Badge className="text-xs bg-primary text-primary-foreground">Popular</Badge>
                      )}
                    </div>

                    {option.description && <p className="text-xs text-muted-foreground mb-1">{option.description}</p>}

                    {option.warning && (
                      <div className="text-xs text-destructive bg-destructive/10 p-1.5 rounded border border-destructive/20">
                        <div className="flex items-center gap-1">
                          <Circle className="w-2 h-2 fill-current" />
                          <span>{option.warning}</span>
                        </div>
                      </div>
                    )}

                    {option.image && (
                      <div className="mt-2">
                        <img
                          src={option.image || "/placeholder.svg"}
                          alt={option.label}
                          className="w-12 h-12 object-contain rounded border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=48&width=48&query=" + encodeURIComponent(option.label)
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>

      {/* Clear/None option */}
      {clearOption && (
        <div className="flex justify-center mb-6">
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              !hasSelections ? "ring-2 ring-primary bg-primary/5 shadow-md" : "hover:bg-accent/50 hover:shadow-sm"
            }`}
            onClick={() => onClearAll()}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-muted-foreground">
                {!hasSelections && <Check className="w-4 h-4 text-primary" />}
              </div>
              <div>
                <span className="font-medium">{clearOption.label}</span>
                {clearOption.description && <p className="text-sm text-muted-foreground">{clearOption.description}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Radio groups */}
      {radioGroups.map((group, index) => {
        const groupOptions = options.filter((opt) => group.options.includes(opt.id))
        return <div key={index}>{renderOptionGroup(groupOptions, group.title, group.allow_multi)}</div>
      })}

      {/* Ungrouped options */}
      {ungroupedOptions.length > 0 && (
        <div>{renderOptionGroup(ungroupedOptions, radioGroups.length > 0 ? "Other Options" : undefined, true)}</div>
      )}

      {/* Selection summary */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {hasSelections ? (
              <span>
                <strong>{selectedOptionIds.length}</strong> option{selectedOptionIds.length !== 1 ? "s" : ""} selected
              </span>
            ) : (
              <span>No options selected</span>
            )}
          </div>
          {hasSelections && (
            <Button variant="outline" size="sm" onClick={onClearAll} className="text-xs bg-transparent">
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {radioGroups.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            <p>
              <strong>Selection Rules:</strong> You can select multiple options from different categories. Within each
              single-selection category, only one option can be chosen.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
