"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import type { QuoteOption } from "@/types/quote-builder"

interface MultiSelectOptionGroupProps {
  options: QuoteOption[]
  selectedOptionIds: number[]
  onOptionToggle: (option: QuoteOption) => void
  onClearAll: () => void
  title: string
  description?: string
  columns?: number
}

export function MultiSelectOptionGroup({
  options,
  selectedOptionIds,
  onOptionToggle,
  onClearAll,
  title,
  description,
  columns = 2,
}: MultiSelectOptionGroupProps) {
  const hasSelections = selectedOptionIds.length > 0
  const noneOption = options.find((opt) => opt.value === "none")
  const regularOptions = options.filter((opt) => opt.value !== "none")

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>

      {/* None/Clear option */}
      {noneOption && (
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
                <span className="font-medium">{noneOption.label}</span>
                {noneOption.description && <p className="text-sm text-muted-foreground">{noneOption.description}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Regular options grid */}
      <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
        {regularOptions.map((option) => {
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
                      {option.warning && (
                        <Badge variant="destructive" className="text-xs">
                          Warning
                        </Badge>
                      )}
                    </div>

                    {option.description && <p className="text-sm text-muted-foreground mb-2">{option.description}</p>}

                    {option.warning && (
                      <div className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                        ⚠️ {option.warning}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
      </div>
    </div>
  )
}
