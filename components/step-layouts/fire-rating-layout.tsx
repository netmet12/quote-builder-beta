"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Info, Flame } from "lucide-react"
import type { QuoteOption } from "@/types/quote-builder"

interface FireRatingLayoutProps {
  options: QuoteOption[]
  selectedOptionIds: number[]
  onOptionSelect: (option: QuoteOption) => void
  title: string
}

export function FireRatingLayout({ options, selectedOptionIds, onOptionSelect, title }: FireRatingLayoutProps) {
  const getFireRatingLevel = (option: QuoteOption) => {
    const label = option.label.toLowerCase()
    if (label.includes("no fire") || label.includes("non-rated")) return 0
    if (label.includes("20")) return 20
    if (label.includes("45")) return 45
    if (label.includes("60")) return 60
    if (label.includes("90")) return 90
    if (label.includes("3 hour") || label.includes("180")) return 180
    return 0
  }

  const getFireRatingIcon = (level: number) => {
    if (level === 0) return <Shield className="w-6 h-6 text-gray-400" />
    if (level <= 45) return <Flame className="w-6 h-6 text-orange-400" />
    if (level <= 90) return <Flame className="w-6 h-6 text-orange-600" />
    return <Flame className="w-6 h-6 text-red-600" />
  }

  const getFireRatingColor = (level: number) => {
    if (level === 0) return "bg-gray-50 border-gray-200"
    if (level <= 45) return "bg-orange-50 border-orange-200"
    if (level <= 90) return "bg-orange-100 border-orange-300"
    return "bg-red-50 border-red-300"
  }

  const getFireRatingDescription = (level: number) => {
    switch (level) {
      case 0:
        return "Standard door with no fire rating requirements"
      case 20:
        return "Basic fire protection for specific applications"
      case 45:
        return "Corridor and room separation applications"
      case 60:
        return "Stairwell and vertical shaft applications"
      case 90:
        return "High-rise and critical facility applications"
      case 180:
        return "Maximum fire protection - requires special construction"
      default:
        return "Fire-rated door for building code compliance"
    }
  }

  const sortedOptions = options.sort((a, b) => getFireRatingLevel(a) - getFireRatingLevel(b))

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Info className="h-4 w-4" />
          <span className="text-sm">Select the fire rating required by your local building code</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {sortedOptions.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id)
          const fireLevel = getFireRatingLevel(option)
          const isHighRating = fireLevel >= 180
          const hasWarning = option.warning || isHighRating

          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? "ring-2 ring-primary bg-primary/5 shadow-md"
                  : `hover:shadow-sm ${getFireRatingColor(fireLevel)}`
              }`}
              onClick={() => onOptionSelect(option)}
            >
              <CardContent className="p-6 space-y-4">
                {/* Fire Rating Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFireRatingIcon(fireLevel)}
                    <div>
                      <h3 className="font-semibold text-card-foreground text-lg">{option.label}</h3>
                      {fireLevel > 0 && (
                        <p className="text-sm font-medium text-muted-foreground">
                          {fireLevel >= 180 ? "3 Hours" : `${fireLevel} Minutes`}
                        </p>
                      )}
                    </div>
                  </div>

                  {option.isPopular && (
                    <Badge className="bg-primary text-primary-foreground text-xs">Most Common</Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {option.description || getFireRatingDescription(fireLevel)}
                </p>

                {/* Fire Rating Level Indicator */}
                {fireLevel > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Fire Protection Level</span>
                      <span className="font-medium">
                        {fireLevel >= 180 ? "Maximum" : fireLevel <= 45 ? "Basic" : "High"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          fireLevel === 0
                            ? "bg-gray-300"
                            : fireLevel <= 45
                              ? "bg-orange-400"
                              : fireLevel <= 90
                                ? "bg-orange-600"
                                : "bg-red-600"
                        }`}
                        style={{ width: `${Math.min((fireLevel / 180) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {hasWarning && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800">Special Requirements</p>
                        <p className="text-amber-700 mt-1">
                          {option.warning ||
                            "3-hour fire doors require special wall construction and installation procedures"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selection Status */}
                {isSelected && (
                  <div className="flex items-center justify-center pt-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">Selected</Badge>
                  </div>
                )}

                {/* Tooltip */}
                {option.tooltip && (
                  <div className="text-xs text-muted-foreground italic border-t pt-3">
                    <Info className="w-3 h-3 inline mr-1" />
                    {option.tooltip}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Fire Rating Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <h4 className="font-semibold mb-2">Fire Rating Guidelines</h4>
            <ul className="space-y-1 text-blue-700">
              <li>
                • <strong>No Fire Rating:</strong> Standard applications where fire protection is not required
              </li>
              <li>
                • <strong>20-45 Minutes:</strong> Interior doors, corridors, and room separations
              </li>
              <li>
                • <strong>60-90 Minutes:</strong> Stairwells, elevator shafts, and high-rise buildings
              </li>
              <li>
                • <strong>3 Hours:</strong> Maximum protection for critical facilities and special hazard areas
              </li>
            </ul>
            <p className="mt-3 text-xs">
              <strong>Note:</strong> Fire-rated doors must be installed according to local building codes. Professional
              installation is recommended for all fire-rated applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
