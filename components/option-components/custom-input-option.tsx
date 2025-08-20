"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Edit2, Check, AlertCircle } from "lucide-react"
import type { QuoteOption } from "@/types/quote-builder"

interface CustomInputOptionProps {
  option: QuoteOption
  isSelected: boolean
  currentValue?: string
  onSelect: (option: QuoteOption) => void
  onSubmit: (option: QuoteOption, value: string) => void
  inputLabel?: string
  inputType?: "text" | "number" | "textarea"
  placeholder?: string
  validation?: (value: string) => string | null
}

export function CustomInputOption({
  option,
  isSelected,
  currentValue,
  onSelect,
  onSubmit,
  inputLabel,
  inputType = "text",
  placeholder = "Enter value...",
  validation,
}: CustomInputOptionProps) {
  const [inputValue, setInputValue] = useState(currentValue || "")
  const [isEditing, setIsEditing] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (currentValue) {
      setInputValue(currentValue)
    }
  }, [currentValue])

  const handleSubmit = () => {
    if (validation) {
      const error = validation(inputValue)
      if (error) {
        setValidationError(error)
        return
      }
    }

    if (inputValue.trim()) {
      onSubmit(option, inputValue.trim())
      setIsEditing(false)
      setValidationError(null)
    }
  }

  const handleEdit = () => {
    if (!isSelected) {
      onSelect(option)
    }
    setIsEditing(true)
    setValidationError(null)
  }

  const handleCancel = () => {
    setInputValue(currentValue || "")
    setIsEditing(false)
    setValidationError(null)
  }

  return (
    <Card
      className={`transition-all duration-200 ${
        isSelected ? "ring-2 ring-primary bg-primary/5 shadow-md" : "hover:bg-accent/50 hover:shadow-sm cursor-pointer"
      }`}
      onClick={!isSelected && !isEditing ? () => onSelect(option) : undefined}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Option header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-card-foreground">{option.label}</h4>
              {option.isPopular && <Badge className="text-xs bg-primary text-primary-foreground">Popular</Badge>}
            </div>
            {isSelected && !isEditing && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit2 className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {option.description && <p className="text-sm text-muted-foreground">{option.description}</p>}

          {/* Current value display */}
          {isSelected && currentValue && !isEditing && (
            <div className="p-3 bg-background rounded border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-foreground">Current Selection:</span>
              </div>
              <p className="text-sm text-muted-foreground font-mono">{currentValue}</p>
            </div>
          )}

          {/* Input form */}
          {(isEditing || (isSelected && !currentValue)) && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
              <Label htmlFor={`input-${option.id}`} className="text-sm font-medium">
                {inputLabel || `Enter ${option.label.toLowerCase()}:`}
              </Label>

              {inputType === "textarea" ? (
                <Textarea
                  id={`input-${option.id}`}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    setValidationError(null)
                  }}
                  placeholder={placeholder}
                  className="min-h-[80px]"
                />
              ) : (
                <Input
                  id={`input-${option.id}`}
                  type={inputType}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    setValidationError(null)
                  }}
                  placeholder={placeholder}
                />
              )}

              {validationError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {validationError}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                  size="sm"
                  className="bg-primary text-primary-foreground"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Save
                </Button>
                {isEditing && (
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Select button for unselected options */}
          {!isSelected && (
            <Button onClick={() => onSelect(option)} variant="outline" className="w-full">
              Select & Customize
            </Button>
          )}

          {/* Warning display */}
          {option.warning && (
            <div className="text-xs text-destructive bg-destructive/10 p-3 rounded border border-destructive/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Warning:</span>
              </div>
              <p className="mt-1">{option.warning}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
