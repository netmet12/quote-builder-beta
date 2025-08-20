"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useQuote } from "@/contexts/quote-context"

export function StepNavigation() {
  const { state, visibleSections, currentSection, previousStep, nextStep, resetQuote } = useQuote()

  const canGoBack = state.currentStep > 0
  const canGoNext = currentSection && state.selections[currentSection.id]
  const isLastStep = state.currentStep >= visibleSections.length - 1

  const handleBack = () => {
    if (state.currentStep === 0) {
      // Go back to product selection
      resetQuote()
    } else {
      previousStep()
    }
  }

  const handleNext = () => {
    if (canGoNext && !isLastStep) {
      nextStep()
    }
  }

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <Button
        variant="outline"
        onClick={handleBack}
        className="flex items-center gap-2 bg-muted text-muted-foreground hover:bg-muted/80 min-w-[100px]"
      >
        <ChevronLeft className="h-4 w-4" />
        GO BACK
      </Button>

      <div className="flex items-center gap-4 text-center">
        <div className="text-sm text-muted-foreground">
          Step {state.currentStep + 1} of {visibleSections.length}
        </div>
        {currentSection && (
          <div>
            <h2 className="text-lg font-semibold text-foreground">{currentSection.title}</h2>
            {currentSection.description && (
              <p className="text-sm text-muted-foreground mt-1">{currentSection.description}</p>
            )}
          </div>
        )}
      </div>

      <Button
        onClick={handleNext}
        disabled={!canGoNext || isLastStep}
        className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 min-w-[100px]"
      >
        {isLastStep ? "FINISH" : "NEXT"}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
