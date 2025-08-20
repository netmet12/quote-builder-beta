"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Edit2, Check } from "lucide-react"
import { useQuote } from "@/contexts/quote-context"
import { useState } from "react"

export function QuoteSidebar() {
  const { currentProduct, getSummary, resetQuote, state, visibleSections, goToStep } = useQuote()
  const [isExpanded, setIsExpanded] = useState(true)

  if (!currentProduct) return null

  const summary = getSummary()
  const totalSteps = visibleSections.length
  const completedSteps = Object.keys(state.selections).length

  const handleStepClick = (stepIndex: number) => {
    // Only allow navigation to completed steps or current step
    if (stepIndex <= state.currentStep) {
      goToStep(stepIndex)
    }
  }

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < state.currentStep) return "completed"
    if (stepIndex === state.currentStep) return "current"
    return "upcoming"
  }

  return (
    <div className="w-80 border-l border-border bg-sidebar">
      <Card className="h-full rounded-none border-0 bg-sidebar">
        <CardHeader className="border-b border-sidebar-border">
          <CardTitle className="flex items-center justify-between text-sidebar-foreground">
            <span>Your Quote Request</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4">
          {isExpanded && (
            <div className="space-y-4">
              {/* Product Type Header */}
              <div className="border-b border-sidebar-border pb-3">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4 text-sidebar-primary" />
                  <h3 className="font-medium text-sidebar-foreground">{currentProduct.name}</h3>
                </div>
                <p className="ml-6 text-sm text-sidebar-foreground/70">{currentProduct.description}</p>
              </div>

              {/* Step-by-step selections */}
              <div className="space-y-2">
                {visibleSections.map((section, index) => {
                  const selection = state.selections[section.id]
                  const status = getStepStatus(index)
                  const isClickable = index <= state.currentStep

                  return (
                    <div
                      key={section.id}
                      className={`rounded-md p-3 transition-all duration-200 ${
                        status === "current"
                          ? "bg-sidebar-primary/10 border border-sidebar-primary/20"
                          : status === "completed"
                            ? "bg-sidebar-accent/30 hover:bg-sidebar-accent/50"
                            : "bg-sidebar-accent/10"
                      } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                      onClick={() => isClickable && handleStepClick(index)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {status === "completed" && <Check className="h-3 w-3 text-green-600 flex-shrink-0" />}
                            {status === "current" && (
                              <div className="h-3 w-3 rounded-full bg-sidebar-primary flex-shrink-0" />
                            )}
                            {status === "upcoming" && (
                              <div className="h-3 w-3 rounded-full border border-sidebar-border flex-shrink-0" />
                            )}
                            <h4 className="text-sm font-medium text-sidebar-foreground truncate">{section.title}</h4>
                          </div>

                          {selection && (
                            <div className="ml-5 text-xs text-sidebar-foreground/70">
                              {(() => {
                                let selectionText = "No selection"

                                // Handle custom input first
                                if (selection.customValue) {
                                  return selection.customValue.length > 40
                                    ? `${selection.customValue.substring(0, 40)}...`
                                    : selection.customValue
                                }

                                // Get options from TRUDOOR data structure
                                let optionsArray = []
                                if (Array.isArray(section.options)) {
                                  optionsArray = section.options
                                } else if (section.options && typeof section.options === "object") {
                                  // Convert TRUDOOR options object to array, preserving all properties
                                  optionsArray = Object.entries(section.options).map(([key, value]) => ({
                                    id: Number.parseInt(key),
                                    ...value,
                                  }))
                                }

                                const selectedOptionNames = []

                                // Match each selected ID with its option data
                                for (const selId of selection.optionIds) {
                                  const numericSelId = Number.parseInt(String(selId))

                                  const matchingOption = optionsArray.find((opt) => {
                                    const optId = Number.parseInt(String(opt.id))
                                    return optId === numericSelId
                                  })

                                  if (matchingOption) {
                                    // Extract the best available name from TRUDOOR data
                                    const optionName =
                                      matchingOption.name ||
                                      matchingOption.label ||
                                      matchingOption.title ||
                                      matchingOption.description ||
                                      `Option ${matchingOption.id}`
                                    selectedOptionNames.push(optionName)
                                  } else {
                                    // If we can't find the option, try to get it from the raw data
                                    console.warn(`Could not find option with ID ${selId} in section ${section.id}`)
                                    selectedOptionNames.push(`Selection ${selId}`)
                                  }
                                }

                                if (selectedOptionNames.length > 0) {
                                  selectionText = selectedOptionNames.join(", ")
                                } else if (selection.optionIds.length > 0) {
                                  // Last resort fallback
                                  selectionText = `${selection.optionIds.length} option${selection.optionIds.length > 1 ? "s" : ""} selected`
                                }

                                return selectionText.length > 40
                                  ? `${selectionText.substring(0, 40)}...`
                                  : selectionText
                              })()}
                            </div>
                          )}

                          {!selection && status !== "upcoming" && (
                            <div className="ml-5 text-xs text-sidebar-foreground/50">No selection</div>
                          )}
                        </div>

                        {status === "completed" && isClickable && (
                          <Edit2 className="h-3 w-3 text-sidebar-foreground/50 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Progress Section */}
              <div className="mt-6 pt-4 border-t border-sidebar-border">
                <div className="flex items-center justify-between text-sm text-sidebar-foreground/70 mb-2">
                  <span>Progress</span>
                  <span>
                    {completedSteps} of {totalSteps} steps
                  </span>
                </div>
                <div className="w-full bg-sidebar-accent/30 rounded-full h-2">
                  <div
                    className="bg-sidebar-primary h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-sidebar-foreground/60 text-center">
                  {completedSteps === totalSteps
                    ? "Quote configuration complete!"
                    : `${totalSteps - completedSteps} steps remaining`}
                </div>
              </div>

              {/* Quote Summary Stats */}
              {completedSteps > 0 && (
                <div className="mt-4 p-3 bg-sidebar-accent/20 rounded-md">
                  <h4 className="text-sm font-medium text-sidebar-foreground mb-2">Quote Summary</h4>
                  <div className="space-y-1 text-xs text-sidebar-foreground/70">
                    <div className="flex justify-between">
                      <span>Product:</span>
                      <span className="font-medium">{currentProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Configurations:</span>
                      <span className="font-medium">{completedSteps}</span>
                    </div>
                    {state.selections[2] && (
                      <div className="flex justify-between">
                        <span>Door Type:</span>
                        <span className="font-medium">
                          {state.selections[2].optionIds.includes(46) ? "Single" : "Double"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                {completedSteps === totalSteps && (
                  <Button className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
                    Get Quote
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={resetQuote}
                  className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent bg-transparent"
                >
                  Restart Quote
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
