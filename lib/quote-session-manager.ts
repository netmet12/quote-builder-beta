import type { QuoteState } from "@/types/quote-builder"

export interface QuoteSession {
  id?: string
  session_id: string
  product_type: number | null
  current_step: number
  total_steps: number
  selections: Record<string, any>
  completed_steps: number[]
  warnings: any[]
  created_at?: string
  updated_at?: string
}

export class QuoteSessionManager {
  private static currentSessionId: string | null = null

  static generateSessionId(): string {
    return `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static getCurrentSessionId(): string {
    if (!this.currentSessionId) {
      // Try to get from localStorage first
      this.currentSessionId = localStorage.getItem("current_quote_session_id") || this.generateSessionId()
      localStorage.setItem("current_quote_session_id", this.currentSessionId)
    }
    return this.currentSessionId
  }

  static async saveSession(quoteState: QuoteState): Promise<boolean> {
    const sessionId = this.getCurrentSessionId()

    const sessionData: QuoteSession = {
      session_id: sessionId,
      product_type: quoteState.selectedProductType,
      current_step: quoteState.currentStep,
      total_steps: 0, // Will be calculated based on visible sections
      selections: quoteState.selections,
      completed_steps: Array.from(quoteState.completedSteps),
      warnings: [],
      updated_at: new Date().toISOString(),
    }

    // Save to localStorage only
    try {
      localStorage.setItem(`quote_session_${sessionId}`, JSON.stringify(sessionData))
      console.log("Quote session saved to localStorage:", sessionId)
      return true
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
      return false
    }
  }

  static async loadSession(): Promise<QuoteState | null> {
    const sessionId = this.getCurrentSessionId()

    // Load from localStorage only
    try {
      const stored = localStorage.getItem(`quote_session_${sessionId}`)
      if (stored) {
        const sessionData = JSON.parse(stored) as QuoteSession
        console.log("Quote session loaded from localStorage:", sessionId)
        return this.convertSessionToQuoteState(sessionData)
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
    }

    return null
  }

  static async clearSession(): Promise<void> {
    const sessionId = this.getCurrentSessionId()

    // Clear from localStorage only
    try {
      localStorage.removeItem(`quote_session_${sessionId}`)
      localStorage.removeItem("current_quote_session_id")
    } catch (error) {
      console.error("Failed to clear from localStorage:", error)
    }

    // Generate new session ID
    this.currentSessionId = null
  }

  static async updateSelections(
    selections: Record<string, any>,
    currentStep?: number,
    warnings?: any[],
  ): Promise<boolean> {
    const sessionId = this.getCurrentSessionId()

    const updateData: Partial<QuoteSession> = {
      session_id: sessionId,
      selections,
      updated_at: new Date().toISOString(),
    }

    if (currentStep !== undefined) {
      updateData.current_step = currentStep
    }

    if (warnings !== undefined) {
      updateData.warnings = warnings
    }

    // Update localStorage only
    try {
      const stored = localStorage.getItem(`quote_session_${sessionId}`)
      if (stored) {
        const sessionData = JSON.parse(stored) as QuoteSession
        const updatedSession = { ...sessionData, ...updateData }
        localStorage.setItem(`quote_session_${sessionId}`, JSON.stringify(updatedSession))
        return true
      }
    } catch (error) {
      console.error("localStorage update failed:", error)
    }

    return false
  }

  private static convertSessionToQuoteState(session: QuoteSession): QuoteState {
    return {
      selectedProductType: session.product_type,
      currentStep: session.current_step,
      selections: session.selections || {},
      isValid: Object.keys(session.selections || {}).length > 0,
      completedSteps: new Set(session.completed_steps || []),
    }
  }
}

// Legacy exports for backward compatibility
export const generateSessionId = QuoteSessionManager.generateSessionId.bind(QuoteSessionManager)
export const saveQuoteSession = async (sessionData: Partial<QuoteSession>) => {
  // This is a simplified version for backward compatibility
  return null
}
export const loadQuoteSession = QuoteSessionManager.loadSession.bind(QuoteSessionManager)
export const updateQuoteSelections = QuoteSessionManager.updateSelections.bind(QuoteSessionManager)
