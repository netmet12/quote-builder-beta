"use client"

import type { QuoteOption } from "@/types/quote-builder"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Key, Circle } from "lucide-react"

interface LockFunctionLayoutProps {
  options: QuoteOption[]
  selectedOptionIds: number[]
  onOptionSelect: (option: QuoteOption) => void
  title: string
}

export function LockFunctionLayout({ options, selectedOptionIds, onOptionSelect, title }: LockFunctionLayoutProps) {
  const getLockDiagram = (label: string) => {
    const lockType = label.toLowerCase()

    if (lockType.includes("entry")) {
      return {
        outside: { key: true, button: false, description: "Key outside" },
        inside: { key: false, button: true, description: "Push button or turn on inside" },
        operation: "Key outside, push button or turn on inside",
      }
    } else if (lockType.includes("storeroom")) {
      return {
        outside: { key: true, button: false, description: "Key outside" },
        inside: { key: false, button: false, description: "Blank inside. Outside always locked" },
        operation: "Key outside, blank inside. Outside always locked",
      }
    } else if (lockType.includes("classroom")) {
      return {
        outside: { key: true, button: false, description: "Key outside" },
        inside: { key: false, button: false, description: "Blank inside. Key unlocks/locks outside" },
        operation: "Key outside, blank inside. Key unlocks/locks outside",
      }
    } else if (lockType.includes("privacy")) {
      return {
        outside: { key: false, button: false, description: "Emergency release outside. Non-keyed" },
        inside: { key: false, button: true, description: "Push button lock on inside" },
        operation: "Bath lock - Push button lock on inside, emergency release outside. Non-keyed",
      }
    } else if (lockType.includes("passage")) {
      return {
        outside: { key: false, button: false, description: "No key or button" },
        inside: { key: false, button: false, description: "No key or button" },
        operation: "No key or button on either side, always unlocked",
      }
    }

    return {
      outside: { key: false, button: false, description: "Standard operation" },
      inside: { key: false, button: false, description: "Standard operation" },
      operation: "Standard lock operation",
    }
  }

  const LockDiagramSVG = ({
    diagram,
    side,
  }: { diagram: ReturnType<typeof getLockDiagram>; side: "outside" | "inside" }) => {
    const sideData = diagram[side]

    return (
      <svg viewBox="0 0 120 80" className="w-full h-16">
        {/* Door outline */}
        <rect x="10" y="10" width="100" height="60" fill="none" stroke="#d1d5db" strokeWidth="2" rx="4" />

        {/* Door handle/lever */}
        <circle cx="85" cy="40" r="3" fill="#6b7280" />
        <rect x="82" y="37" width="15" height="6" fill="#6b7280" rx="3" />

        {/* Key cylinder */}
        {sideData.key && (
          <>
            <circle cx="70" cy="40" r="4" fill="#374151" stroke="#1f2937" strokeWidth="1" />
            <Key className="w-3 h-3" x="67" y="37" fill="#fbbf24" />
          </>
        )}

        {/* Push button */}
        {sideData.button && (
          <>
            <circle cx="70" cy="40" r="4" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
            <Circle className="w-2 h-2" x="69" y="39" fill="#ffffff" />
          </>
        )}

        {/* Side label */}
        <text x="60" y="25" fontSize="10" textAnchor="middle" fill="#374151" fontWeight="bold">
          {side.toUpperCase()}
        </text>

        {/* Operation indicator */}
        {sideData.key && (
          <text x="60" y="55" fontSize="8" textAnchor="middle" fill="#6b7280">
            Key
          </text>
        )}
        {sideData.button && (
          <text x="60" y="55" fontSize="8" textAnchor="middle" fill="#6b7280">
            Button
          </text>
        )}
        {!sideData.key && !sideData.button && (
          <text x="60" y="55" fontSize="8" textAnchor="middle" fill="#6b7280">
            None
          </text>
        )}
      </svg>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">
          Select the lock function that matches your security and access requirements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id)
          const isPopular = option.isPopular
          const diagram = getLockDiagram(option.label)

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

                  <h3 className="text-xl font-semibold text-foreground mb-4 text-center">{option.label}</h3>

                  {/* Lock function diagrams */}
                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <LockDiagramSVG diagram={diagram} side="outside" />
                        <p className="text-xs text-muted-foreground mt-1">{diagram.outside.description}</p>
                      </div>
                      <div className="text-center">
                        <LockDiagramSVG diagram={diagram} side="inside" />
                        <p className="text-xs text-muted-foreground mt-1">{diagram.inside.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Operation description */}
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">{diagram.operation}</p>
                  </div>

                  {option.description && (
                    <p className="text-xs text-muted-foreground mt-3 text-center">{option.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Lock function determines how the door can be locked and unlocked from each side</p>
      </div>
    </div>
  )
}
