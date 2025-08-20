"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check, X, AlertCircle, Info } from "lucide-react"
import type { QuoteOption } from "@/types/quote-builder"

interface RadioGroupConfig {
  [key: string]: {
    title: string
    options: number[]
    required?: boolean
    description?: string
  }
}

interface MultiSelectRadioLayoutProps {
  options: QuoteOption[]
  selectedOptionIds: number[]
  onOptionToggle: (option: QuoteOption) => void
  onClearAll: () => void
  title: string
  description?: string
  radioGroups?: RadioGroupConfig
  clearOptions?: { [key: string]: number[] }
  columns?: number
}

export function MultiSelectRadioLayout({
  options,
  selectedOptionIds,
  onOptionToggle,
  onClearAll,
  title,
  description,
  radioGroups = {},
  clearOptions = {},
  columns = 2,
}: MultiSelectRadioLayoutProps) {
  const hasSelections = selectedOptionIds.length > 0
  const noneOption = options.find((opt) => opt.value === "none" || opt.label.toLowerCase().includes("none"))

  // Group options by radio groups
  const groupedOptions: { [key: string]: QuoteOption[] } = {}
  const ungroupedOptions: QuoteOption[] = []

  // Initialize radio groups
  Object.keys(radioGroups).forEach((groupKey) => {
    groupedOptions[groupKey] = []
  })

  // Categorize options
  options.forEach((option) => {
    if (option.value === "none" || option.label.toLowerCase().includes("none")) {
      return // Handle "none" option separately
    }

    let assigned = false
    Object.entries(radioGroups).forEach(([groupKey, groupConfig]) => {
      if (groupConfig.options.includes(option.id)) {
        groupedOptions[groupKey].push(option)
        assigned = true
      }
    })

    if (!assigned) {
      ungroupedOptions.push(option)
    }
  })

  const handleRadioSelection = (groupKey: string, optionId: string) => {
    const option = options.find((opt) => opt.id === Number.parseInt(optionId))
    if (option) {
      // For radio groups, clear other selections in the same group
      const groupConfig = radioGroups[groupKey]
      const otherGroupOptions = selectedOptionIds.filter((id) => !groupConfig.options.includes(id))
      const newSelection = [...otherGroupOptions, option.id]

      // Clear "none" option if present
      const noneId = noneOption?.id
      const finalSelection = noneId ? newSelection.filter((id) => id !== noneId) : newSelection

      onOptionToggle({ ...option, id: finalSelection[finalSelection.length - 1] })
    }
  }

  const getSelectedRadioValue = (groupKey: string): string => {
    const groupConfig = radioGroups[groupKey]
    const selectedInGroup = selectedOptionIds.find((id) => groupConfig.options.includes(id))
    return selectedInGroup ? selectedInGroup.toString() : ""
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="text-xs">
            Multiple Selection
          </Badge>
          {Object.keys(radioGroups).length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Radio Groups
            </Badge>
          )}
        </div>
      </div>

      {/* None/Clear option */}
      {noneOption && (
        <div className="flex justify-center">
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-md max-w-md ${
              !hasSelections ? "ring-2 ring-primary bg-primary/5 shadow-md" : "hover:bg-accent/50 hover:shadow-sm"
            }`}
            onClick={() => onClearAll()}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-muted-foreground">
                {!hasSelections && <Check className="w-4 h-4 text-primary" />}
              </div>
              <div>
                <span className="font-medium">{noneOption.label}</span>
                {noneOption.description && <p className="text-sm text-muted-foreground">{noneOption.description}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Radio Groups */}
      {Object.entries(radioGroups).map(([groupKey, groupConfig]) => {
        const groupOptions = groupedOptions[groupKey]
        if (groupOptions.length === 0) return null

        return (
          <div key={groupKey} className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">{groupConfig.title}</h3>
              {groupConfig.description && (
                <p className="text-sm text-muted-foreground mt-1">{groupConfig.description}</p>
              )}
              {groupConfig.required && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  Required
                </Badge>
              )}
            </div>

            <RadioGroup
              value={getSelectedRadioValue(groupKey)}
              onValueChange={(value) => handleRadioSelection(groupKey, value)}
              className="space-y-3"
            >
              <div className={`grid grid-cols-1 md:grid-cols-${Math.min(columns, groupOptions.length)} gap-4`}>
                {groupOptions.map((option) => {
                  const isSelected = selectedOptionIds.includes(option.id)

                  return (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Card
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md flex-1 ${
                          isSelected ? "ring-2 ring-primary bg-primary/5 shadow-md" : "hover:bg-accent/50"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <RadioGroupItem value={option.id.toString()} id={`radio-${option.id}`} />
                            <div className="flex-1 min-w-0">
                              <Label htmlFor={`radio-${option.id}`} className="cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-card-foreground">{option.label}</span>
                                  {option.isPopular && (
                                    <Badge className="text-xs bg-primary text-primary-foreground">Popular</Badge>
                                  )}
                                </div>
                              </Label>

                              {option.description && (
                                <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                              )}

                              {option.warning && (
                                <div className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                                  <div className="flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{option.warning}</span>
                                  </div>
                                </div>
                              )}

                              {option.tooltip && (
                                <div className="text-xs text-muted-foreground italic mt-1">
                                  <Info className="w-3 h-3 inline mr-1" />
                                  {option.tooltip}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </RadioGroup>
          </div>
        )
      })}

      {/* Ungrouped Multi-Select Options */}
      {ungroupedOptions.length > 0 && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">Additional Options</h3>
            <p className="text-sm text-muted-foreground">Select all that apply</p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
            {ungroupedOptions.map((option) => {
              const isSelected = selectedOptionIds.includes(option.id)

              return (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected ? "ring-2 ring-primary bg-primary/5 shadow-md" : "hover:bg-accent/50 hover:shadow-sm"
                  }`}
                  onClick={() => onOptionToggle(option)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Checkbox indicator */}
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded border-2 transition-colors ${
                          isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-card-foreground">{option.label}</h4>
                          {option.isPopular && (
                            <Badge className="text-xs bg-primary text-primary-foreground">Popular</Badge>
                          )}
                        </div>

                        {option.description && (
                          <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                        )}

                        {option.warning && (
                          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-4 h-4 inline mr-1" />
                              <span>{option.warning}</span>
                            </div>
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
      )}

      {/* Selection Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
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

        {/* Radio Group Validation */}
        {Object.entries(radioGroups).map(([groupKey, groupConfig]) => {
          if (!groupConfig.required) return null

          const hasGroupSelection = groupConfig.options.some((optionId) => selectedOptionIds.includes(optionId))
          if (hasGroupSelection) return null

          return (
            <div key={groupKey} className="mt-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {groupConfig.title} selection is required
            </div>
          )
        })}
      </div>
    </div>
  )
}
