"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import type { QuoteOption, ConfigurationSection } from "@/types/quote-builder"

interface DefaultGridLayoutProps {
  section: ConfigurationSection
  options: QuoteOption[]
  selectedOptionIds: number[]
  currentSelection: any
  onOptionSelect: (option: QuoteOption) => void
  onCustomSubmit: (option: QuoteOption, value: string) => void
}

export function DefaultGridLayout({
  section,
  options,
  selectedOptionIds,
  currentSelection,
  onOptionSelect,
  onCustomSubmit,
}: DefaultGridLayoutProps) {
  const [customValue, setCustomValue] = useState("")

  const safeOptions = Array.isArray(options) ? options : []

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{section.title}</h2>
        {section.description && <p className="text-muted-foreground">{section.description}</p>}
        {section.required && (
          <Badge variant="secondary" className="mt-2">
            Required
          </Badge>
        )}
      </div>

      {/* Grid layout for options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeOptions.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id)
          const showCustomInput = option.customInput && isSelected

          return (
            <div key={option.id} className="space-y-3">
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? "ring-2 ring-primary bg-primary/5 shadow-md" : "hover:bg-accent/50 hover:shadow-sm"
                }`}
                onClick={() => !option.customInput && onOptionSelect(option)}
              >
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <h3 className="font-semibold text-card-foreground">
                      {option.label || option.name || "Unnamed Option"}
                    </h3>
                    {option.isPopular && (
                      <Badge className="ml-2 bg-primary text-primary-foreground">Most Popular</Badge>
                    )}
                  </div>

                  {option.description && <p className="text-sm text-muted-foreground mb-3">{option.description}</p>}

                  {option.customInput && !isSelected && (
                    <Button onClick={() => onOptionSelect(option)} variant="outline" className="mt-3">
                      Select & Customize
                    </Button>
                  )}

                  {isSelected && !option.customInput && (
                    <div className="mt-3 flex items-center justify-center">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Selected
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom input field */}
              {showCustomInput && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4 space-y-3">
                    <Label htmlFor={`custom-${option.id}`} className="text-sm font-medium">
                      {section.customInputLabel || "Enter custom value:"}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`custom-${option.id}`}
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        placeholder="Enter value..."
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          onCustomSubmit(option, customValue)
                          setCustomValue("")
                        }}
                        disabled={!customValue.trim()}
                        size="sm"
                        className="bg-primary text-primary-foreground"
                      >
                        Save
                      </Button>
                    </div>
                    {currentSelection?.customValue && (
                      <div className="text-sm text-muted-foreground bg-background p-2 rounded border">
                        <strong>Current value:</strong> {currentSelection.customValue}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )
        })}
      </div>

      {safeOptions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No options available for this section.</p>
        </div>
      )}

      {/* Selection guidance */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          {section.type === "multiple" ? (
            <>
              <strong>Multiple Selection:</strong> You can select multiple options. Click to toggle selections.
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
