"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StepContent } from "@/components/step-content"
import { useQuote } from "@/contexts/quote-context"
import { Building2, Zap, Shield } from "lucide-react"

export function MetalBuildingDoorLayout() {
  const { state, visibleSections } = useQuote()

  const progressPercentage =
    visibleSections.length > 0 ? Math.round(((state.currentStep + 1) / visibleSections.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Metal Building Door Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Building2 className="w-8 h-8 text-slate-600" />
          <h1 className="text-3xl font-bold text-foreground">Metal Building Door</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Engineered specifically for pre-engineered steel buildings. Designed to integrate seamlessly with metal
          building systems and withstand industrial environments.
        </p>

        {/* Progress indicator */}
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span>Configuration Progress</span>
            <span>{progressPercentage}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Industrial Features Banner */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-slate-600" />
              <div>
                <h4 className="font-semibold text-slate-800">Pre-Engineered Integration</h4>
                <p className="text-sm text-slate-700">Designed for steel building systems</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-slate-600" />
              <div>
                <h4 className="font-semibold text-slate-800">Industrial Strength</h4>
                <p className="text-sm text-slate-700">Heavy-duty construction</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-slate-600" />
              <div>
                <h4 className="font-semibold text-slate-800">Weather Resistant</h4>
                <p className="text-sm text-slate-700">Built for harsh environments</p>
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

        {/* Building Integration Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-600" />
                Building Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Standard Sizes</h4>
                <p className="text-sm text-muted-foreground">
                  Pre-engineered dimensions that integrate with standard building modules
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Custom Sizing</h4>
                <p className="text-sm text-muted-foreground">Tailored dimensions for unique building requirements</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Structural Integration</h4>
                <p className="text-sm text-muted-foreground">Designed to work with building's structural system</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Warehouses & Distribution Centers</p>
              <p>• Manufacturing Facilities</p>
              <p>• Aircraft Hangars</p>
              <p>• Agricultural Buildings</p>
              <p>• Storage Facilities</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
