"use client"

import type { QuoteOption } from "@/types/quote-builder"
import { Card } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle } from "lucide-react"

interface WallConstructionLayoutProps {
  options: QuoteOption[]
  selectedOption: number | null
  onSelect: (optionId: number) => void
  sectionTitle: string
}

export function WallConstructionLayout({
  options,
  selectedOption,
  onSelect,
  sectionTitle,
}: WallConstructionLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">{sectionTitle}</h2>
        <div className="flex items-center justify-center gap-2 text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm">This affects frame installation and rough opening requirements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {options.map((option) => (
          <Card
            key={option.id}
            className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              selectedOption === option.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => onSelect(option.id)}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === option.id ? "border-primary bg-primary" : "border-muted-foreground"
                }`}
              >
                {selectedOption === option.id && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
              </div>

              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{option.label}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>

                {/* Add specific guidance for wall construction */}
                {option.label === "Yes" && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">
                      Frame will be installed into existing opening. Precise measurements required.
                    </p>
                  </div>
                )}

                {option.label === "No" && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700">
                      Frame will be installed first, then wall built around it. More flexibility in sizing.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
