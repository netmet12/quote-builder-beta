"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ComplianceDashboard } from "@/components/compliance/compliance-dashboard"
import { StepContent } from "@/components/step-content"
import { useQuote } from "@/contexts/quote-context"
import { Shield, Ruler, Wrench, AlertTriangle } from "lucide-react"

export function MetalDoorLayout() {
  const { state, visibleSections, complianceResult } = useQuote()

  const progressPercentage =
    visibleSections.length > 0 ? Math.round(((state.currentStep + 1) / visibleSections.length) * 100) : 0

  const currentSection = visibleSections[state.currentStep]
  const sectionCategory = currentSection ? getSectionCategory(currentSection.title) : null

  return (
    <div className="space-y-6">
      {/* Metal Door Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Metal Door Configuration</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Configure your commercial-grade metal door with precision. Our system ensures compliance with building codes
          and manufacturing standards.
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

      {/* Section Category Banner */}
      {sectionCategory && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {sectionCategory.icon}
              <div>
                <h3 className="font-semibold text-primary">{sectionCategory.title}</h3>
                <p className="text-sm text-muted-foreground">{sectionCategory.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Configuration Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Configuration Steps - Takes up 2 columns */}
        <div className="xl:col-span-2">
          <StepContent />
        </div>

        {/* Compliance Dashboard - Takes up 1 column */}
        <div className="space-y-6">
          <ComplianceDashboard complianceResult={complianceResult} />

          {/* Quick Reference Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metal Door Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  18 Gauge
                </Badge>
                <span>Heavy-duty steel construction</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  Fire Rated
                </Badge>
                <span>Up to 3-hour fire ratings available</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  ADA Ready
                </Badge>
                <span>Meets accessibility requirements</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  USA Made
                </Badge>
                <span>Manufactured in the United States</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getSectionCategory(title: string) {
  const lowerTitle = title.toLowerCase()

  if (
    lowerTitle.includes("door type") ||
    lowerTitle.includes("single or double") ||
    lowerTitle.includes("width") ||
    lowerTitle.includes("height")
  ) {
    return {
      title: "Door Specifications",
      description: "Define the basic dimensions and configuration of your door",
      icon: <Ruler className="w-5 h-5 text-blue-600" />,
    }
  }

  if (lowerTitle.includes("fire") || lowerTitle.includes("interior or exterior") || lowerTitle.includes("hand")) {
    return {
      title: "Performance Requirements",
      description: "Set safety, security, and operational requirements",
      icon: <Shield className="w-5 h-5 text-green-600" />,
    }
  }

  if (lowerTitle.includes("frame") || lowerTitle.includes("wall") || lowerTitle.includes("thickness")) {
    return {
      title: "Installation Details",
      description: "Configure frame and installation specifications",
      icon: <Wrench className="w-5 h-5 text-orange-600" />,
    }
  }

  if (
    lowerTitle.includes("lite") ||
    lowerTitle.includes("louver") ||
    lowerTitle.includes("emboss") ||
    lowerTitle.includes("protect")
  ) {
    return {
      title: "Door Features & Accessories",
      description: "Add optional features and protective elements",
      icon: <AlertTriangle className="w-5 h-5 text-purple-600" />,
    }
  }

  return null
}
