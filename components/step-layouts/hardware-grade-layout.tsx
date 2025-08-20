"use client"

import type { QuoteOption } from "@/types/quote-builder"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Shield, Zap, Building } from "lucide-react"

interface HardwareGradeLayoutProps {
  options: QuoteOption[]
  selectedOptionIds: number[]
  onOptionSelect: (option: QuoteOption) => void
  title: string
}

export function HardwareGradeLayout({ options, selectedOptionIds, onOptionSelect, title }: HardwareGradeLayoutProps) {
  const getGradeIcon = (label: string) => {
    if (label.toLowerCase().includes("light")) return Zap
    if (label.toLowerCase().includes("medium")) return Shield
    if (label.toLowerCase().includes("heavy")) return Building
    return Shield
  }

  const getGradeColor = (label: string) => {
    if (label.toLowerCase().includes("light")) return "text-green-600"
    if (label.toLowerCase().includes("medium")) return "text-blue-600"
    if (label.toLowerCase().includes("heavy")) return "text-red-600"
    return "text-gray-600"
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">
          Choose the hardware grade based on your door's usage and security requirements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id)
          const isPopular = option.isPopular
          const IconComponent = getGradeIcon(option.label)
          const iconColor = getGradeColor(option.label)

          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? "ring-2 ring-primary border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => onOptionSelect(option)}
            >
              <CardContent className="p-6 text-center">
                <div className="relative">
                  {isPopular && (
                    <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white">Most Popular</Badge>
                  )}

                  {isSelected && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}

                  {/* Grade icon */}
                  <div className="mb-4">
                    <IconComponent className={`w-16 h-16 mx-auto ${iconColor}`} />
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-2">{option.label}</h3>

                  {option.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{option.description}</p>
                  )}

                  {/* Usage recommendations */}
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      {option.label.toLowerCase().includes("light") && "Best for: Low traffic areas, residential use"}
                      {option.label.toLowerCase().includes("medium") && "Best for: Medium traffic, commercial use"}
                      {option.label.toLowerCase().includes("heavy") &&
                        "Best for: High traffic, high security applications"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Hardware grade determines durability, security level, and expected lifespan</p>
      </div>
    </div>
  )
}
