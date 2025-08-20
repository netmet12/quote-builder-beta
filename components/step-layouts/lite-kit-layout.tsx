"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, Square, RectangleVerticalIcon as Rectangle, AlertCircle, Info } from "lucide-react"
import { useState } from "react"
import type { QuoteOption } from "@/types/quote-builder"

interface LiteKitLayoutProps {
  options: QuoteOption[]
  selectedOptionIds: number[]
  currentSelection: any
  onOptionSelect: (option: QuoteOption) => void
  onCustomSubmit: (option: QuoteOption, value: string) => void
  title: string
}

export function LiteKitLayout({
  options,
  selectedOptionIds,
  currentSelection,
  onOptionSelect,
  onCustomSubmit,
  title,
}: LiteKitLayoutProps) {
  const [customDimensions, setCustomDimensions] = useState("")

  const getLiteKitType = (option: QuoteOption) => {
    const label = option.label.toLowerCase()
    if (label.includes("no lite") || label.includes("solid")) return "none"
    if (label.includes("square")) return "square"
    if (label.includes("rectangle")) return "rectangle"
    if (label.includes("custom")) return "custom"
    return "standard"
  }

  const getLiteKitDimensions = (option: QuoteOption) => {
    const label = option.label
    const dimensionMatch = label.match(/(\d+)"?\s*x\s*(\d+)"?/i)
    if (dimensionMatch) {
      return {
        width: Number.parseInt(dimensionMatch[1]),
        height: Number.parseInt(dimensionMatch[2]),
      }
    }

    const singleDimensionMatch = label.match(/(\d+)"?\s*x\s*(\d+)"?/i) || label.match(/(\d+)"\s*Square/i)
    if (singleDimensionMatch) {
      const size = Number.parseInt(singleDimensionMatch[1])
      return { width: size, height: size }
    }

    return { width: 12, height: 12 }
  }

  const getLiteKitIcon = (type: string, dimensions: { width: number; height: number }) => {
    if (type === "none") return <Eye className="w-8 h-8 text-gray-400" strokeWidth={1} />
    if (type === "square" || dimensions.width === dimensions.height) {
      return <Square className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
    }
    return <Rectangle className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
  }

  const renderLiteKitPreview = (dimensions: { width: number; height: number }, type: string) => {
    if (type === "none") {
      return (
        <div className="w-24 h-32 bg-gray-200 border-2 border-gray-300 rounded flex items-center justify-center">
          <span className="text-xs text-gray-500 font-medium">Solid Door</span>
        </div>
      )
    }

    const aspectRatio = dimensions.width / dimensions.height
    const maxWidth = 80
    const maxHeight = 100

    let previewWidth = Math.min(maxWidth, dimensions.width * 3)
    let previewHeight = Math.min(maxHeight, dimensions.height * 3)

    if (previewWidth / previewHeight > aspectRatio) {
      previewWidth = previewHeight * aspectRatio
    } else {
      previewHeight = previewWidth / aspectRatio
    }

    return (
      <div className="w-24 h-32 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center relative">
        {/* Door outline */}
        <div className="absolute inset-2 border border-gray-400 rounded-sm">
          {/* Vision panel */}
          <div
            className="bg-blue-100 border border-blue-300 rounded-sm absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              width: `${previewWidth}px`,
              height: `${previewHeight}px`,
              maxWidth: "60px",
              maxHeight: "80px",
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-blue-300 rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
        <span className="absolute bottom-1 text-xs text-gray-600 font-medium">
          {dimensions.width}" × {dimensions.height}"
        </span>
      </div>
    )
  }

  const validateCustomDimensions = (value: string): string | null => {
    if (!value.trim()) return "Please enter dimensions"

    const dimensionRegex = /^\s*(\d+(?:\.\d+)?)\s*['"x]\s*(\d+(?:\.\d+)?)\s*['"]?\s*$/i
    if (!dimensionRegex.test(value)) {
      return 'Please enter dimensions in format: 12" x 18" or 12 x 18'
    }

    const match = value.match(dimensionRegex)
    if (match) {
      const width = Number.parseFloat(match[1])
      const height = Number.parseFloat(match[2])

      if (width < 6 || height < 6) return "Minimum size is 6 inches"
      if (width > 24 || height > 36) return 'Maximum size is 24" × 36"'
      if (width * height > 500) return "Total area too large"
    }

    return null
  }

  const sortedOptions = options.sort((a, b) => {
    const typeA = getLiteKitType(a)
    const typeB = getLiteKitType(b)
    if (typeA === "none") return -1
    if (typeB === "none") return 1
    if (typeA === "custom") return 1
    if (typeB === "custom") return -1

    const dimA = getLiteKitDimensions(a)
    const dimB = getLiteKitDimensions(b)
    return dimA.width * dimA.height - dimB.width * dimB.height
  })

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Info className="h-4 w-4" />
          <span className="text-sm">Vision panels provide natural light and visibility through the door</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {sortedOptions.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id)
          const type = getLiteKitType(option)
          const dimensions = getLiteKitDimensions(option)
          const isCustom = option.customInput
          const showCustomInput = isCustom && isSelected

          return (
            <div key={option.id} className="space-y-3">
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? "ring-2 ring-primary bg-primary/5 shadow-md" : "hover:bg-accent/50 hover:shadow-sm"
                }`}
                onClick={() => !isCustom && onOptionSelect(option)}
              >
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getLiteKitIcon(type, dimensions)}
                      <div>
                        <h3 className="font-semibold text-card-foreground">{option.label}</h3>
                        {type !== "none" && type !== "custom" && (
                          <p className="text-sm text-muted-foreground">
                            {dimensions.width}" × {dimensions.height}" vision panel
                          </p>
                        )}
                      </div>
                    </div>

                    {option.isPopular && (
                      <Badge className="bg-primary text-primary-foreground text-xs">Most Popular</Badge>
                    )}
                  </div>

                  {/* Visual Preview */}
                  <div className="flex justify-center">{renderLiteKitPreview(dimensions, type)}</div>

                  {/* Description */}
                  {option.description && (
                    <p className="text-sm text-muted-foreground text-center">{option.description}</p>
                  )}

                  {/* Custom Input Button */}
                  {isCustom && !isSelected && (
                    <Button onClick={() => onOptionSelect(option)} variant="outline" className="w-full">
                      Select & Specify Dimensions
                    </Button>
                  )}

                  {/* Selection Status */}
                  {isSelected && !isCustom && (
                    <div className="flex justify-center">
                      <Badge className="bg-green-100 text-green-800 border-green-200">Selected</Badge>
                    </div>
                  )}

                  {/* Warnings */}
                  {option.warning && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-700">{option.warning}</p>
                      </div>
                    </div>
                  )}

                  {/* Tooltip */}
                  {option.tooltip && (
                    <div className="text-xs text-muted-foreground italic text-center">{option.tooltip}</div>
                  )}
                </CardContent>
              </Card>

              {/* Custom Input Field */}
              {showCustomInput && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label htmlFor={`custom-${option.id}`} className="text-sm font-medium">
                        Enter Custom Dimensions
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">Format: Width × Height (e.g., 15 x 20)</p>
                    </div>

                    <div className="space-y-3">
                      <Input
                        id={`custom-${option.id}`}
                        value={customDimensions}
                        onChange={(e) => setCustomDimensions(e.target.value)}
                        placeholder="12 x 18"
                        className="text-center"
                      />

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            const validation = validateCustomDimensions(customDimensions)
                            if (!validation) {
                              onCustomSubmit(option, customDimensions)
                              setCustomDimensions("")
                            }
                          }}
                          disabled={!customDimensions.trim() || !!validateCustomDimensions(customDimensions)}
                          className="flex-1"
                        >
                          Save Dimensions
                        </Button>
                        <Button onClick={() => onOptionSelect({ ...option, id: -1 })} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>

                      {customDimensions && validateCustomDimensions(customDimensions) && (
                        <p className="text-sm text-destructive">{validateCustomDimensions(customDimensions)}</p>
                      )}

                      {currentSelection?.customValue && (
                        <div className="text-sm bg-background p-3 rounded border">
                          <strong>Current dimensions:</strong> {currentSelection.customValue}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )
        })}
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <h4 className="font-semibold mb-2">Lite Kit Guidelines</h4>
            <ul className="space-y-1 text-blue-700">
              <li>
                • <strong>No Lite Kit:</strong> Solid door provides maximum security and privacy
              </li>
              <li>
                • <strong>Standard Sizes:</strong> Pre-manufactured sizes for quick delivery
              </li>
              <li>
                • <strong>Custom Sizes:</strong> Available from 6" × 6" up to 24" × 36"
              </li>
              <li>
                • <strong>Fire Rating:</strong> Lite kits must match the door's fire rating
              </li>
              <li>
                • <strong>Glass Options:</strong> Clear, frosted, or wire glass available
              </li>
            </ul>
            <p className="mt-3 text-xs">
              <strong>Note:</strong> Embossed doors cannot accommodate lite kits due to manufacturing constraints.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
