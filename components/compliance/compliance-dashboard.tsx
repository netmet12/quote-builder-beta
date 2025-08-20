"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { WarningDisplay } from "@/components/validation/warning-display"
import { BusinessRulesEngine } from "@/lib/business-rules-engine"
import type { ComplianceResult } from "@/lib/business-rules-engine"
import { CheckCircle, AlertTriangle, XCircle, DollarSign, FileCheck } from "lucide-react"

interface ComplianceDashboardProps {
  complianceResult: ComplianceResult
  className?: string
}

export function ComplianceDashboard({ complianceResult, className = "" }: ComplianceDashboardProps) {
  const summary = BusinessRulesEngine.getComplianceSummary(complianceResult)
  const pricing = BusinessRulesEngine.calculatePriceAdjustments(complianceResult)

  const getStatusIcon = () => {
    switch (summary.status) {
      case "compliant":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "warnings":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case "blocked":
        return <XCircle className="w-5 h-5 text-red-600" />
    }
  }

  const getStatusColor = () => {
    switch (summary.status) {
      case "compliant":
        return "bg-green-50 border-green-200 text-green-800"
      case "warnings":
        return "bg-orange-50 border-orange-200 text-orange-800"
      case "blocked":
        return "bg-red-50 border-red-200 text-red-800"
    }
  }

  const complianceScore = complianceResult.isCompliant ? (complianceResult.warningRules.length === 0 ? 100 : 85) : 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Compliance Status Overview */}
      <Card className={`border-2 ${getStatusColor()}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <CardTitle className="text-lg">Compliance Status</CardTitle>
                <p className="text-sm opacity-75">{summary.summary}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{complianceScore}%</div>
              <div className="text-xs opacity-75">Compliance Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={complianceScore} className="mb-3" />
          <div className="flex items-center justify-between text-sm">
            <span>Configuration Status</span>
            <Badge variant={summary.status === "compliant" ? "default" : "secondary"}>
              {summary.status === "compliant" ? "Ready to Quote" : "Needs Attention"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Messages */}
      {complianceResult.messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Compliance Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WarningDisplay messages={complianceResult.messages} />
          </CardContent>
        </Card>
      )}

      {/* Pricing Impact */}
      {pricing.adjustments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Base Price:</span>
              <span>${pricing.basePrice.toLocaleString()}</span>
            </div>

            {pricing.adjustments.map((adjustment, index) => (
              <div key={index} className="flex justify-between text-sm border-l-2 border-primary/20 pl-3">
                <span>{adjustment.description}:</span>
                <span className="text-primary">+${adjustment.amount.toLocaleString()}</span>
              </div>
            ))}

            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Total Price:</span>
              <span className="text-lg">${pricing.finalPrice.toLocaleString()}</span>
            </div>

            {pricing.totalAdjustment > 0 && (
              <div className="text-xs text-muted-foreground">
                Total adjustments: +${pricing.totalAdjustment.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {complianceResult.isCompliant && (
          <Button className="flex-1 bg-primary text-primary-foreground">Generate Quote</Button>
        )}
        {complianceResult.requiresApproval && (
          <Button variant="outline" className="flex-1 bg-transparent">
            Request Approval
          </Button>
        )}
        {!complianceResult.isCompliant && (
          <Button variant="outline" className="flex-1 bg-transparent" disabled>
            Resolve Issues First
          </Button>
        )}
      </div>
    </div>
  )
}
