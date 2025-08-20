// Core types for the TRUDOOR Quote Builder system

export interface QuoteOption {
  id: number
  label: string
  value: string
  description?: string
  isPopular?: boolean
  customInput?: boolean
}

export interface SectionCondition {
  section: number
  options: number[]
  condition: "IN" | "NOT"
}

export interface OptionCondition {
  params: SectionCondition[]
  show: number[]
}

export interface ConfigurationSection {
  id: number
  title: string
  description?: string
  type: "single" | "multiple"
  required: boolean
  options: QuoteOption[]
  sectionConditions?: SectionCondition[][]
  optionConditions?: OptionCondition[]
  customInputLabel?: string
}

export interface ProductType {
  id: string
  name: string
  description: string
  image: string
  sections: ConfigurationSection[]
}

export interface QuoteSelection {
  sectionId: number
  optionIds: number[]
  customValue?: string
}

export interface QuoteState {
  selectedProductType: string | null
  currentStep: number
  selections: Record<number, QuoteSelection>
  isValid: boolean
  completedSteps: Set<number>
}

export interface QuoteContextType {
  state: QuoteState
  productTypes: ProductType[]
  currentProduct: ProductType | null
  currentSection: ConfigurationSection | null
  visibleSections: ConfigurationSection[]
  selectProduct: (productId: string) => void
  makeSelection: (sectionId: number, optionIds: number[], customValue?: string) => void
  goToStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  resetQuote: () => void
  getSummary: () => { section: string; selection: string }[]
}

export interface TrudoorOption {
  product_id: number
  name: string
  description: string
  tooltip: string
  is_most_popular: number
  requires_input: number
  primary_image?: string
}

export interface TrudoorSectionCondition {
  section: number
  options: number[]
  condition: "IN" | "NOT"
}

export interface TrudoorOptionCondition {
  params: TrudoorSectionCondition[]
  show: number[]
}

export interface TrudoorSection {
  category_id: number
  columns: number
  options: Record<string, TrudoorOption>
  section_conditions?: TrudoorSectionCondition[][]
  option_conditions?: TrudoorOptionCondition[]
  title: string
  tooltip: string
  order: number[]
}

export interface TrudoorData {
  _types: Record<string, string>
  _type_keys: Record<string, number>
  _type_images: Record<string, string>
  _type_sections: Record<string, number>
  _type_descriptions: Record<string, string>
  sections: Record<string, Record<string, TrudoorSection>>
}

export interface TrudoorProductType {
  id: number
  name: string
  description: string
  image: string
  sections: Record<string, TrudoorSection>
  totalSections: number
}

export interface EnhancedQuoteSelection {
  sectionId: number
  optionIds: number[]
  customValue?: string
}

export interface EnhancedQuoteState {
  selectedProductType: number | null // Changed from string to number
  currentStep: number
  selections: Record<number, EnhancedQuoteSelection>
  isValid: boolean
  completedSteps: Set<number>
}

export interface EnhancedQuoteContextType {
  state: EnhancedQuoteState
  productTypes: TrudoorProductType[]
  currentProduct: TrudoorProductType | null
  currentSection: TrudoorSection | null
  visibleSections: TrudoorSection[]
  selectProduct: (productId: number) => void
  makeSelection: (sectionId: number, optionIds: number[], customValue?: string) => void
  goToStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  resetQuote: () => void
  getSummary: () => { section: string; selection: string }[]
}
