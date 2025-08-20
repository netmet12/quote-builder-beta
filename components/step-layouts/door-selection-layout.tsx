"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { QuoteOption } from "@/types/quote-builder"

interface DoorSelectionLayoutProps {
  options: QuoteOption[]
  selectedOptionIds: number[]
  onOptionSelect: (option: QuoteOption) => void
  title: string
}

export function DoorSelectionLayout({ options, selectedOptionIds, onOptionSelect, title }: DoorSelectionLayoutProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-foreground">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {options.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id)

          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isSelected
                  ? "ring-2 ring-primary bg-primary/5 shadow-lg scale-[1.02]"
                  : "hover:shadow-md hover:scale-[1.01]"
              }`}
              onClick={() => onOptionSelect(option)}
            >
              <CardContent className="p-8 text-center">
                {/* Door Image */}
                <div className="mb-6 flex justify-center">
                  <img
                    src={`/placeholder.svg?height=200&width=150&query=${option.value} door`}
                    alt={option.label}
                    className="h-48 w-36 object-contain"
                  />
                </div>

                {/* Door Label */}
                <h3 className="text-xl font-semibold text-card-foreground mb-2">{option.label}</h3>

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
