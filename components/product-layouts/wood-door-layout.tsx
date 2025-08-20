"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StepContent } from "@/components/step-content"
import { useQuote } from "@/contexts/quote-context"
import { TreePine, Home, Palette } from "lucide-react"

export function WoodDoorLayout() {
  const { state, visibleSections } = useQuote()

  const progressPercentage =
    visibleSections.length > 0 ? Math.round(((state.currentStep + 1) / visibleSections.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Wood Door Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <TreePine className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-foreground">Wood Door Configuration</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create a beautiful interior wood door with premium materials and craftsmanship. Perfect for residential and
          commercial interior applications.
        </p>

        {/* Progress indicator */}
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span>Configuration Progress</span>
            <span>{progressPercentage}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-amber-100" />
        </div>
      </div>

      {/* Wood Door Features Banner */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Home className="w-6 h-6 text-amber-600" />
              <div>
                <h4 className="font-semibold text-amber-800">Interior Use Only</h4>
                <p className="text-sm text-amber-700">Designed for indoor applications</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Palette className="w-6 h-6 text-amber-600" />
              <div>
                <h4 className="font-semibold text-amber-800">Premium Materials</h4>
                <p className="text-sm text-amber-700">Solid wood construction</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TreePine className="w-6 h-6 text-amber-600" />
              <div>
                <h4 className="font-semibold text-amber-800">Natural Beauty</h4>
                <p className="text-sm text-amber-700">Rich wood grain patterns</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Configuration Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Configuration Steps - Takes up 3 columns */}
        <div className="xl:col-span-3">
          <StepContent />
        </div>

        {/* Wood Types Reference */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TreePine className="w-5 h-5 text-amber-600" />
                Wood Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Oak</span>
                  <Badge variant="outline" className="text-xs">
                    Hardwood
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Durable with prominent grain pattern</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Maple</span>
                  <Badge variant="outline" className="text-xs">
                    Hardwood
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Light colored with fine grain</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Cherry</span>
                  <Badge variant="outline" className="text-xs">
                    Premium
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Rich reddish tone, ages beautifully</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Pine</span>
                  <Badge variant="outline" className="text-xs">
                    Softwood
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Affordable option with rustic appeal</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Care Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Regular dusting with soft cloth</p>
              <p>• Avoid harsh chemicals</p>
              <p>• Maintain stable humidity levels</p>
              <p>• Refinish every 5-7 years</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
