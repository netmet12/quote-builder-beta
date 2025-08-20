"use client"

import type { QuoteOption } from "@/types/quote-builder"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

interface HardwareFinishLayoutProps {
  options: QuoteOption[]
  selectedOptionIds: number[]
  onOptionSelect: (option: QuoteOption) => void
  title: string
}

export function HardwareFinishLayout({ options, selectedOptionIds, onOptionSelect, title }: HardwareFinishLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">Select the hardware finish that best matches your project requirements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id)
          const isPopular = option.isPopular

          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? "ring-2 ring-primary border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => onOptionSelect(option)}
            >
              <CardContent className="p-6">
                <div className="relative">
                  {isPopular && (
                    <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white">Most Popular</Badge>
                  )}

                  {isSelected && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}

                  {/* Hardware finish visual sample */}
                  <div className="w-full h-32 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <img
                      src={`/placeholder.svg?height=128&width=200&query=${encodeURIComponent(
                        `${option.label} hardware finish sample`,
                      )}`}
                      alt={option.label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                        target.nextElementSibling?.classList.remove("hidden")
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
                      <span className="text-gray-600 font-medium">{option.label}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-2">{option.label}</h3>

                  {option.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{option.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Hardware finish affects the appearance and durability of your door hardware</p>
      </div>
    </div>
  )
}
