"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import type { QuoteOption } from "@/types/quote-builder"

interface DoorWidthLayoutProps {
  options: QuoteOption[]
  selectedOptionIds: number[]
  onOptionSelect: (option: QuoteOption) => void
  title: string
}

export function DoorWidthLayout({ options, selectedOptionIds, onOptionSelect, title }: DoorWidthLayoutProps) {
  const parseWidthOption = (option: QuoteOption) => {
    const label = option.label || option.name || ""
    const description = option.description || ""

    // Extract width label (e.g., "2'6\"" from "2'6\" (30 inch)")
    const widthMatch = label.match(/^([^(]+)/)
    const widthLabel = widthMatch ? widthMatch[1].trim() : label

    // Extract size info from parentheses (e.g., "30 inch" from "2'6\" (30 inch)")
    const sizeMatch = label.match(/$$([^)]+)$$/)
    const sizeInfo = sizeMatch ? sizeMatch[1] : ""

    return {
      widthLabel,
      sizeInfo,
      description,
      hasValidData: widthLabel.length > 0,
    }
  }

  const validOptions = options
    .filter((option) => {
      const parsed = parseWidthOption(option)
      return parsed.hasValidData
    })
    .sort((a, b) => {
      // Sort by product_id or id to maintain consistent ordering
      return (a.id || 0) - (b.id || 0)
    })

  if (validOptions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground">No door width options available for your selection.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Info className="h-4 w-4" />
          <span className="text-sm">Select the door width that best fits your opening</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
        {validOptions.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id)
          const { widthLabel, sizeInfo, description } = parseWidthOption(option)

          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? "ring-2 ring-primary bg-primary/5 shadow-md" : "hover:bg-accent/50 hover:shadow-sm"
              }`}
              onClick={() => onOptionSelect(option)}
            >
              <CardContent className="p-4 text-center space-y-2">
                {/* Width Label */}
                <div className="space-y-1">
                  <h3 className="font-semibold text-card-foreground text-lg leading-tight">{widthLabel}</h3>
                  {sizeInfo && <p className="text-sm text-muted-foreground font-medium">{sizeInfo}</p>}
                </div>

                {/* Actual Size Description */}
                {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}

                {/* Badges */}
                <div className="flex flex-col gap-1">
                  {option.isPopular && (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">Most Popular</Badge>
                  )}

                  {isSelected && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Selected</Badge>
                  )}
                </div>

                {/* Tooltip Info */}
                {option.tooltip && <p className="text-xs text-muted-foreground italic">{option.tooltip}</p>}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
        <p>
          Door widths are shown as nominal sizes. Actual door sizes are typically 3/4" smaller than nominal. Single
          doors are available in widths up to 3'0", while double doors use wider individual leaves.
        </p>
      </div>
    </div>
  )
}
