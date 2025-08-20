"use client"

import { useQuote } from "@/contexts/quote-context"
import { DoorSelectionLayout } from "@/components/step-layouts/door-selection-layout"
import { DoorWidthLayout } from "@/components/step-layouts/door-width-layout"
import { DoorTypeLayout } from "@/components/step-layouts/door-type-layout"
import { WallConstructionLayout } from "@/components/step-layouts/wall-construction-layout"
import { FireRatingLayout } from "@/components/step-layouts/fire-rating-layout"
import { LiteKitLayout } from "@/components/step-layouts/lite-kit-layout"
import { MultiSelectRadioLayout } from "@/components/step-layouts/multi-select-radio-layout"
import { EnhancedGridLayout } from "@/components/step-layouts/enhanced-grid-layout"
import { Button } from "@/components/ui/button"
import { HardwareFinishLayout } from "@/components/step-layouts/hardware-finish-layout"
import { HardwareGradeLayout } from "@/components/step-layouts/hardware-grade-layout"
import { WallThicknessLayout } from "@/components/step-layouts/wall-thickness-layout"
import { LockFunctionLayout } from "@/components/step-layouts/lock-function-layout"
import type { QuoteOption } from "@/types/quote-builder"

export function StepContent() {
  const { currentSection, state, makeSelection } = useQuote()

  if (!currentSection) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Quote Complete!</h2>
        <p className="text-muted-foreground mb-6">
          Thank you for using the TRUDOOR Quote Builder. Your configuration is ready for review.
        </p>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Download Quote Summary</Button>
      </div>
    )
  }

  const currentSelection = state.selections[currentSection.id]
  const selectedOptionIds = currentSelection?.optionIds || []

  const handleOptionSelect = (option: QuoteOption) => {
    if (currentSection.type === "single") {
      // Single selection - replace current selection
      makeSelection(currentSection.id, [option.id])
    } else {
      // Multiple selection - toggle option
      if (option.value === "none") {
        // Clear all selections for "none" option
        makeSelection(currentSection.id, [option.id])
      } else {
        // Toggle option and remove "none" if present
        const noneOption = currentSection.options.find((opt) => opt.value === "none")
        const currentWithoutNone = selectedOptionIds.filter((id) => id !== noneOption?.id)

        const newSelection = currentWithoutNone.includes(option.id)
          ? currentWithoutNone.filter((id) => id !== option.id)
          : [...currentWithoutNone, option.id]

        makeSelection(currentSection.id, newSelection)
      }
    }
  }

  const handleCustomSubmit = (option: QuoteOption, customValue: string) => {
    if (customValue.trim()) {
      makeSelection(currentSection.id, [option.id], customValue.trim())
    }
  }

  const handleMultiSelectToggle = (option: QuoteOption) => {
    const noneOption = currentSection.options.find((opt) => opt.value === "none")

    if (option.value === "none") {
      makeSelection(currentSection.id, [option.id])
    } else {
      const currentWithoutNone = selectedOptionIds.filter((id) => id !== noneOption?.id)
      const newSelection = currentWithoutNone.includes(option.id)
        ? currentWithoutNone.filter((id) => id !== option.id)
        : [...currentWithoutNone, option.id]

      makeSelection(currentSection.id, newSelection)
    }
  }

  const handleClearAll = () => {
    const noneOption = currentSection.options.find(
      (opt) => opt.value === "none" || opt.label.toLowerCase().includes("none"),
    )

    if (noneOption && noneOption.id) {
      makeSelection(currentSection.id, [noneOption.id])
    } else {
      makeSelection(currentSection.id, [])
    }
  }

  const getStepLayout = () => {
    const title = currentSection.title.toLowerCase()

    // Single or Double Door selection
    if (title.includes("single or double door")) {
      return (
        <DoorSelectionLayout
          options={currentSection.options}
          selectedOptionIds={selectedOptionIds}
          onOptionSelect={handleOptionSelect}
          title={currentSection.title}
        />
      )
    }

    // Door Width selection
    if (title.includes("door width") || title.includes("width")) {
      return (
        <DoorWidthLayout
          options={currentSection.options}
          selectedOptionIds={selectedOptionIds}
          onOptionSelect={handleOptionSelect}
          title={currentSection.title}
        />
      )
    }

    // Door Type selection
    if (title.includes("door type") || title.includes("metal door type")) {
      return (
        <DoorTypeLayout
          options={currentSection.options}
          selectedOptionIds={selectedOptionIds}
          onOptionSelect={handleOptionSelect}
          title={currentSection.title}
        />
      )
    }

    if (title.includes("fire-rated") || title.includes("fire rating")) {
      return (
        <FireRatingLayout
          options={currentSection.options}
          selectedOptionIds={selectedOptionIds}
          onOptionSelect={handleOptionSelect}
          title={currentSection.title}
        />
      )
    }

    if (title.includes("lite kit") || title.includes("vision panel")) {
      return (
        <LiteKitLayout
          options={currentSection.options}
          selectedOptionIds={selectedOptionIds}
          currentSelection={currentSelection}
          onOptionSelect={handleOptionSelect}
          onCustomSubmit={handleCustomSubmit}
          title={currentSection.title}
        />
      )
    }

    if (title.includes("has the wall been built")) {
      return (
        <WallConstructionLayout
          options={currentSection.options}
          selectedOption={selectedOptionIds[0] || null}
          onSelect={(optionId) => {
            const option = currentSection.options.find((opt) => opt.id === optionId)
            if (option) handleOptionSelect(option)
          }}
          sectionTitle={currentSection.title}
        />
      )
    }

    if (title.includes("wall thickness")) {
      return (
        <WallThicknessLayout
          options={currentSection.options}
          selectedOptionIds={selectedOptionIds}
          currentSelection={currentSelection}
          onOptionSelect={handleOptionSelect}
          onCustomSubmit={handleCustomSubmit}
          title={currentSection.title}
        />
      )
    }

    // Hardware Finish selection
    if (title.includes("hardware finish")) {
      return (
        <HardwareFinishLayout
          options={currentSection.options}
          selectedOptionIds={selectedOptionIds}
          onOptionSelect={handleOptionSelect}
          title={currentSection.title}
        />
      )
    }

    // Hardware Grade selection
    if (title.includes("hardware grade")) {
      return (
        <HardwareGradeLayout
          options={currentSection.options}
          selectedOptionIds={selectedOptionIds}
          onOptionSelect={handleOptionSelect}
          title={currentSection.title}
        />
      )
    }

    // Lock Function selection
    if (title.includes("lock function")) {
      return (
        <LockFunctionLayout
          options={currentSection.options}
          selectedOptionIds={selectedOptionIds}
          onOptionSelect={handleOptionSelect}
          title={currentSection.title}
        />
      )
    }

    if (currentSection.type === "multi" && (currentSection.radios || currentSection.clear)) {
      return (
        <MultiSelectRadioLayout
          options={currentSection.options}
          selectedOptionIds={selectedOptionIds}
          onOptionToggle={handleMultiSelectToggle}
          onClearAll={handleClearAll}
          title={currentSection.title}
          description={currentSection.tooltip}
          radioGroups={currentSection.radios}
          clearOptions={currentSection.clear}
          columns={currentSection.columns || 2}
        />
      )
    }

    // Enhanced grid layout for all other sections (supports multi-select and custom inputs)
    return (
      <EnhancedGridLayout
        section={currentSection}
        options={currentSection.options}
        selectedOptionIds={selectedOptionIds}
        currentSelection={currentSelection}
        onOptionSelect={handleOptionSelect}
        onCustomSubmit={handleCustomSubmit}
      />
    )
  }

  return <div className="max-w-6xl mx-auto">{getStepLayout()}</div>
}
