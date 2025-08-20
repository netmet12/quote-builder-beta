"use client"

import type React from "react"

import { StepNavigation } from "@/components/step-navigation"
import { QuoteSidebar } from "@/components/quote-sidebar"
import { MetalDoorLayout } from "@/components/product-layouts/metal-door-layout"
import { WoodDoorLayout } from "@/components/product-layouts/wood-door-layout"
import { MetalBuildingDoorLayout } from "@/components/product-layouts/metal-building-door-layout"
import { HardwareOnlyLayout } from "@/components/product-layouts/hardware-only-layout"
import { useQuote } from "@/contexts/quote-context"

interface QuoteBuilderLayoutProps {
  children: React.ReactNode
}

export function QuoteBuilderLayout({ children }: QuoteBuilderLayoutProps) {
  const { state, currentProduct } = useQuote()

  // Only show the layout when a product is selected
  if (!state.selectedProductType) {
    return <>{children}</>
  }

  // Hardware-only products don't need the full quote builder interface
  const isHardwareOnly = currentProduct?.isHardwareOnly

  if (isHardwareOnly) {
    const getHardwareLayout = () => {
      switch (currentProduct?.id) {
        case "lite-kits-glazing":
          return <HardwareOnlyLayout productType="lite-kits-glazing" />
        case "door-hardware":
          return <HardwareOnlyLayout productType="door-hardware" />
        case "louvers":
          return <HardwareOnlyLayout productType="louvers" />
        default:
          return children
      }
    }

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="px-4 py-2 text-center">
            <span className="text-sm text-muted-foreground">Featuring Doors Made in the USA! 🇺🇸</span>
          </div>
        </header>
        {getHardwareLayout()}
      </div>
    )
  }

  const getProductSpecificContent = () => {
    if (!currentProduct) return children

    switch (currentProduct.id) {
      case "metal-door":
        return <MetalDoorLayout />
      case "wood-door":
        return <WoodDoorLayout />
      case "metal-building-door":
        return <MetalBuildingDoorLayout />
      default:
        return children
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with USA flag */}
      <header className="border-b border-border bg-card">
        <div className="px-4 py-2 text-center">
          <span className="text-sm text-muted-foreground">Featuring Doors Made in the USA! 🇺🇸</span>
        </div>
      </header>

      {/* Step Navigation */}
      <StepNavigation />

      {/* Main layout with sidebar for all configurable products */}
      <div className="flex">
        <main className="flex-1">{getProductSpecificContent()}</main>
        <QuoteSidebar />
      </div>
    </div>
  )
}
