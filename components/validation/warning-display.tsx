"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react"

export interface ValidationMessage {
  type: "error" | "warning" | "info" | "success"
  title: string
  message: string
  section?: string
  affectedOptions?: string[]
}

interface WarningDisplayProps {
  messages: ValidationMessage[]
  className?: string
}

export function WarningDisplay({ messages, className = "" }: WarningDisplayProps) {
  if (messages.length === 0) return null

  const getIcon = (type: ValidationMessage["type"]) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-4 h-4" />
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "info":
        return <Info className="w-4 h-4" />
      case "success":
        return <CheckCircle className="w-4 h-4" />
    }
  }

  const getVariant = (type: ValidationMessage["type"]) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "default"
      case "info":
        return "default"
      case "success":
        return "default"
    }
  }

  const getColorClasses = (type: ValidationMessage["type"]) => {
    switch (type) {
      case "error":
        return "border-destructive/50 bg-destructive/10 text-destructive"
      case "warning":
        return "border-orange-500/50 bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-200"
      case "info":
        return "border-blue-500/50 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
      case "success":
        return "border-green-500/50 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {messages.map((message, index) => (
        <Alert key={index} variant={getVariant(message.type)} className={getColorClasses(message.type)}>
          <div className="flex items-start gap-3">
            {getIcon(message.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{message.title}</span>
                {message.section && (
                  <Badge variant="outline" className="text-xs">
                    {message.section}
                  </Badge>
                )}
              </div>
              <AlertDescription className="text-sm">{message.message}</AlertDescription>
              {message.affectedOptions && message.affectedOptions.length > 0 && (
                <div className="mt-2 text-xs opacity-75">
                  <span className="font-medium">Affected options:</span> {message.affectedOptions.join(", ")}
                </div>
              )}
            </div>
          </div>
        </Alert>
      ))}
    </div>
  )
}
