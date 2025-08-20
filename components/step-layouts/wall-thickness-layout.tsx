"use client"

import type { QuoteOption } from "@/types/quote-builder"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface WallThicknessLayoutProps {
  options: QuoteOption[]
  selectedOptionIds: number[]
  currentSelection?: { optionIds: number[]; customValue?: string }
  onOptionSelect: (option: QuoteOption) => void
  onCustomSubmit: (option: QuoteOption, customValue: string) => void
  title: string
}

export function WallThicknessLayout({
  options,
  selectedOptionIds,
  currentSelection,
  onOptionSelect,
  onCustomSubmit,
  title,
}: WallThicknessLayoutProps) {
  const [customValue, setCustomValue] = useState(currentSelection?.customValue || "")

  const getWallDiagram = (label: string) => {
    // Extract thickness from label (e.g., "4-5/8" from "4-5/8\" (w/ wood stud)")
    const thickness = label.match(/(\d+-?\d*\/?\d*)/)?.[1] || ""

    if (thickness.includes("4-5/8") || thickness.includes("4-7/8")) {
      return {
        studSize: "2x4",
        studWidth: '3.5"',
        drywall: thickness.includes("4-5/8") ? '1/2"' : '5/8"',
        totalThickness: thickness + '"',
      }
    } else if (thickness.includes("6-1/8") || thickness.includes("6-3/4")) {
      return {
        studSize: "2x6",
        studWidth: '5.5"',
        drywall: thickness.includes("6-1/8") ? '1/2"' : '5/8"',
        totalThickness: thickness + '"',
      }
    }

    return {
      studSize: "2x4",
      studWidth: '3.5"',
      drywall: '1/2"',
      totalThickness: thickness + '"',
    }
  }

  const WallDiagramSVG = ({ diagram }: { diagram: ReturnType<typeof getWallDiagram> }) => (
    <svg viewBox="0 0 200 120" className="w-full h-24">
      {/* Drywall left */}
      <rect x="10" y="20" width="15" height="80" fill="#f5f5f5" stroke="#d1d5db" strokeWidth="1" />
      <text x="17" y="65" fontSize="8" textAnchor="middle" fill="#6b7280" transform="rotate(-90 17 65)">
        {diagram.drywall} DRYWALL
      </text>

      {/* Wood stud */}
      <rect x="25" y="15" width="35" height="90" fill="#d2b48c" stroke="#8b4513" strokeWidth="1" />
      <text x="42" y="65" fontSize="10" textAnchor="middle" fill="#654321" transform="rotate(-90 42 65)">
        {diagram.studSize} STUD
      </text>

      {/* Drywall right */}
      <rect x="60" y="20" width="15" height="80" fill="#f5f5f5" stroke="#d1d5db" strokeWidth="1" />
      <text x="67" y="65" fontSize="8" textAnchor="middle" fill="#6b7280" transform="rotate(-90 67 65)">
        {diagram.drywall} DRYWALL
      </text>

      {/* Dimension lines */}
      <line
        x1="5"
        y1="110"
        x2="80"
        y2="110"
        stroke="#374151"
        strokeWidth="1"
        markerEnd="url(#arrowhead)"
        markerStart="url(#arrowhead)"
      />
      <text x="42" y="108" fontSize="10" textAnchor="middle" fill="#374151" fontWeight="bold">
        {diagram.totalThickness}
      </text>

      {/* Arrow markers */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
        </marker>
      </defs>
    </svg>
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">Select the wall thickness that matches your construction</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {options
          .filter((opt) => !opt.customInput)
          .map((option) => {
            const isSelected = selectedOptionIds.includes(option.id)
            const isPopular = option.isPopular
            const diagram = getWallDiagram(option.label)

            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected
                    ? "ring-2 ring-primary border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => onOptionSelect(option)}
              >
                <CardContent className="p-4">
                  <div className="relative">
                    {isPopular && (
                      <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">Most Popular</Badge>
                    )}

                    {isSelected && (
                      <div className="absolute top-2 left-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}

                    {/* Wall construction diagram */}
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <WallDiagramSVG diagram={diagram} />
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-1">{option.label}</h3>

                    {option.description && <p className="text-xs text-muted-foreground mb-2">{option.description}</p>}

                    {/* Construction details */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Stud:</span>
                        <span className="font-medium">{diagram.studSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Drywall:</span>
                        <span className="font-medium">{diagram.drywall}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium">{diagram.totalThickness}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>

      {/* Custom thickness input */}
      {options.some((opt) => opt.customInput) && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Other Wall Thickness</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Enter custom wall thickness:</label>
                <Input
                  type="text"
                  placeholder="e.g., 5-1/2 inches"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                onClick={() => {
                  const customOption = options.find((opt) => opt.customInput)
                  if (customOption && customValue.trim()) {
                    onCustomSubmit(customOption, customValue.trim())
                  }
                }}
                disabled={!customValue.trim()}
                className="w-full"
              >
                Use Custom Thickness
              </Button>
              {currentSelection?.customValue && (
                <p className="text-sm text-muted-foreground text-center">
                  Current custom thickness: <span className="font-medium">{currentSelection.customValue}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-sm text-muted-foreground">
        <p>Wall thickness affects frame depth and installation requirements</p>
      </div>
    </div>
  )
}
