"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useQuote } from "@/contexts/quote-context"
import type { ProductType } from "@/types/quote-builder"

interface ProductCardProps {
  product: ProductType
}

export function ProductCard({ product }: ProductCardProps) {
  const { selectProduct } = useQuote()

  const handleSelect = () => {
    selectProduct(product.id)
  }

  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
      <CardContent className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <img src={product.image || "/placeholder.svg"} alt={product.name} className="h-32 w-32 object-contain" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-card-foreground">{product.name}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{product.description}</p>
        <Button onClick={handleSelect} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          Select
        </Button>
      </CardContent>
    </Card>
  )
}
