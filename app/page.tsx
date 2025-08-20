"use client"

import { ProductCard } from "@/components/product-card"
import { HardwareCard } from "@/components/hardware-card"
import { QuoteBuilderLayout } from "@/components/quote-builder-layout"
import { StepContent } from "@/components/step-content"
import { useQuote } from "@/contexts/quote-context"

export default function HomePage() {
  const { productTypes, state } = useQuote()

  return (
    <QuoteBuilderLayout>
      {/* Show step content if product is selected */}
      {state.selectedProductType ? (
        <StepContent />
      ) : (
        /* Product Selection Landing Page */
        <div className="min-h-screen bg-background">
          {/* Header Section */}
          <header className="border-b border-border bg-card">
            <div className="mx-auto max-w-7xl px-4 py-6">
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">Featuring Doors Made in the USA! 🇺🇸</span>
                </div>
                <h1 className="mb-2 text-4xl font-bold text-foreground">
                  TRUDOOR<sup className="text-lg">®</sup> Quote Builder
                </h1>
                <p className="text-lg text-muted-foreground">Select a product below to start building your quote.</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="mx-auto max-w-7xl px-4 py-12">
            {/* Product Selection Grid */}
            <section className="mb-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                {productTypes.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>

            {/* Hardware Section */}
            <section>
              <div className="mb-8 text-center">
                <p className="text-lg text-muted-foreground">Just need lite kits, glass, louvers, or hardware?</p>
                <p className="text-xl font-semibold text-foreground">Visit our new hardware store!</p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <HardwareCard
                  title="Lite Kits & Glazing"
                  image="/placeholder.svg?height=150&width=150"
                  description="Glass inserts and glazing options"
                />
                <HardwareCard
                  title="Door Hardware"
                  image="/placeholder.svg?height=150&width=150"
                  description="Hinges, locks, handles, and accessories"
                />
                <HardwareCard
                  title="Louvers"
                  image="/placeholder.svg?height=150&width=150"
                  description="Ventilation and airflow solutions"
                />
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="border-t border-border bg-card mt-16">
            <div className="mx-auto max-w-7xl px-4 py-8">
              <div className="text-center text-sm text-muted-foreground">
                <p>© 2024 TRUDOOR. All rights reserved.</p>
                <p className="mt-2">Professional door solutions made in the USA</p>
              </div>
            </div>
          </footer>
        </div>
      )}
    </QuoteBuilderLayout>
  )
}
