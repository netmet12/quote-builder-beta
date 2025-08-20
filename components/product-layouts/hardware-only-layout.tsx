"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, Package, ShoppingCart } from "lucide-react"

interface HardwareOnlyLayoutProps {
  productType: "lite-kits-glazing" | "door-hardware" | "louvers"
}

export function HardwareOnlyLayout({ productType }: HardwareOnlyLayoutProps) {
  const getProductInfo = () => {
    switch (productType) {
      case "lite-kits-glazing":
        return {
          title: "Lite Kits & Glazing",
          description: "Glass panels, frames, and glazing components for door installations",
          icon: <Package className="w-8 h-8 text-blue-600" />,
          features: [
            "Vision panels in multiple sizes",
            "Tempered and insulated glass options",
            "Fire-rated glazing available",
            "Custom sizing available",
          ],
          applications: ["Door vision panels", "Sidelight installations", "Transom windows", "Custom glazing projects"],
        }
      case "door-hardware":
        return {
          title: "Door Hardware",
          description: "Professional-grade locks, handles, hinges, and door control hardware",
          icon: <Wrench className="w-8 h-8 text-orange-600" />,
          features: [
            "Commercial-grade locks",
            "Heavy-duty hinges",
            "Door closers & operators",
            "Panic hardware available",
          ],
          applications: [
            "New door installations",
            "Hardware upgrades",
            "Maintenance replacements",
            "Security enhancements",
          ],
        }
      case "louvers":
        return {
          title: "Louvers",
          description: "Ventilation louvers for air circulation and environmental control",
          icon: <Package className="w-8 h-8 text-green-600" />,
          features: [
            "Multiple sizes available",
            "Weather-resistant finishes",
            "Fire-rated options",
            "Custom configurations",
          ],
          applications: ["Door ventilation", "HVAC integration", "Equipment cooling", "Air circulation systems"],
        }
    }
  }

  const productInfo = getProductInfo()

  return (
    <div className="space-y-6">
      {/* Hardware Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          {productInfo.icon}
          <h1 className="text-3xl font-bold text-foreground">{productInfo.title}</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">{productInfo.description}</p>
      </div>

      {/* Hardware Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {productInfo.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  ✓
                </Badge>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Common Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {productInfo.applications.map((application, index) => (
              <div key={index} className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  •
                </Badge>
                <span className="text-sm">{application}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Contact for Catalog */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-8 text-center space-y-4">
          <ShoppingCart className="w-12 h-12 text-primary mx-auto" />
          <h3 className="text-xl font-semibold text-primary">Request Product Catalog</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our {productInfo.title.toLowerCase()} catalog contains detailed specifications, pricing, and availability
            information.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Download Catalog
            </button>
            <button className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors">
              Contact Sales
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <h4 className="font-semibold mb-2">Professional Installation</h4>
            <p className="text-sm text-muted-foreground">Expert installation services available</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <h4 className="font-semibold mb-2">Technical Support</h4>
            <p className="text-sm text-muted-foreground">Engineering assistance for complex projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <h4 className="font-semibold mb-2">Custom Solutions</h4>
            <p className="text-sm text-muted-foreground">Tailored products for unique requirements</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
