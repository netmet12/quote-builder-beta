"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { QuoteOption } from "@/types/quote-builder"

interface DoorTypeLayoutProps {
  options: QuoteOption[]
  selectedOptionIds: number[]
  onOptionSelect: (option: QuoteOption) => void
  title: string
}

export function DoorTypeLayout({ options, selectedOptionIds, onOptionSelect, title }: DoorTypeLayoutProps) {
  const safeOptions = Array.isArray(options) ? options : []

  if (safeOptions.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-foreground">{title}</h2>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No options available for this section.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-foreground">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {safeOptions.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id)

          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isSelected ? "ring-2 ring-primary bg-primary/5 shadow-lg" : "hover:shadow-md"
              }`}
              onClick={() => onOptionSelect(option)}
            >
              <CardContent className="p-8 text-center">
                {/* Door Type Image */}
                <div className="mb-6 flex justify-center">
                  <img
                    src={`/placeholder.svg?height=180&width=120&query=${option.value} door type`}
                    alt={option.label}
                    className="h-44 w-32 object-contain"
                  />
                </div>

                {/* Type Label */}
                <h3 className="text-xl font-semibold text-card-foreground mb-2">{option.label}</h3>

                {/* Description */}
                {option.description && <p className="text-sm text-muted-foreground mb-4">{option.description}</p>}

                {/* Selection Indicator */}
                {isSelected && <Badge className="bg-green-100 text-green-800 border-green-200">Selected</Badge>}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
