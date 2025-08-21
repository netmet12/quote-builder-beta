import { supabase } from './supabase.js'

/**
 * Supabase Data Service
 * Replaces the JSON-based data loading with database queries
 */

export class SupabaseDataService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Get cached data or fetch from database
   */
  async getCachedData(key, fetchFn) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    const data = await fetchFn()
    this.cache.set(key, { data, timestamp: Date.now() })
    return data
  }

  /**
   * Get all product types
   */
  async getProductTypes() {
    return this.getCachedData('product_types', async () => {
      const { data, error } = await supabase
        .from('product_types')
        .select('*')
        .order('id')

      if (error) {
        console.error('Error fetching product types:', error)
        return []
      }

      return data.map(type => ({
        id: type.id,
        name: type.name,
        description: type.description || '',
        image: type.image_url || '/placeholder.svg'
      }))
    })
  }

  /**
   * Get all sections for a product type
   */
  async getSectionsForProduct(productId) {
    return this.getCachedData(`sections_${productId}`, async () => {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('product_type_id', productId)
        .order('display_order')

      if (error) {
        console.error(`Error fetching sections for product ${productId}:`, error)
        return []
      }

      return data.map(section => ({
        id: section.id,
        title: section.title,
        tooltip: section.tooltip || '',
        columns: section.columns || 4,
        multi_select: section.multi_select || false,
        clear: section.clear_option_id || null,
        category_id: section.category_id
      }))
    })
  }

  /**
   * Get all options for a specific section
   */
  async getOptionsForSection(productId, sectionId) {
    return this.getCachedData(`options_${productId}_${sectionId}`, async () => {
      const { data, error } = await supabase
        .from('options')
        .select('*')
        .eq('product_type_id', productId)
        .eq('section_id', sectionId)
        .order('display_order')

      if (error) {
        console.error(`Error fetching options for section ${sectionId}:`, error)
        return {}
      }

      const options = {}
      const order = []

      data.forEach(option => {
        options[option.id] = {
          name: option.name,
          description: option.description || '',
          tooltip: option.tooltip || '',
          primary_image: option.primary_image || '/placeholder.svg',
          is_most_popular: option.is_most_popular,
          requires_input: option.requires_input,
          product_id: option.product_id
        }
        order.push(option.id)
      })

      return { options, order }
    })
  }

  /**
   * Get section conditions for visibility logic
   */
  async getSectionConditions(productId, sectionId) {
    return this.getCachedData(`section_conditions_${productId}_${sectionId}`, async () => {
      const { data, error } = await supabase
        .from('section_conditions')
        .select('*')
        .eq('product_type_id', productId)
        .eq('section_id', sectionId)
        .order('condition_group')

      if (error) {
        console.error(`Error fetching section conditions for ${sectionId}:`, error)
        return []
      }

      // Group conditions by condition_group (for OR logic)
      const groupedConditions = {}
      data.forEach(condition => {
        if (!groupedConditions[condition.condition_group]) {
          groupedConditions[condition.condition_group] = []
        }
        groupedConditions[condition.condition_group].push({
          section: condition.required_section,
          options: condition.required_options,
          condition: condition.condition_type,
          allow_null: condition.allow_null
        })
      })

      return Object.values(groupedConditions)
    })
  }

  /**
   * Get option conditions for option visibility logic
   */
  async getOptionConditions(productId, sectionId) {
    return this.getCachedData(`option_conditions_${productId}_${sectionId}`, async () => {
      const { data, error } = await supabase
        .from('option_conditions')
        .select('*')
        .eq('product_type_id', productId)
        .eq('section_id', sectionId)
        .order('condition_group')

      if (error) {
        console.error(`Error fetching option conditions for ${sectionId}:`, error)
        return []
      }

      // Group conditions by condition_group
      const groupedConditions = {}
      data.forEach(condition => {
        if (!groupedConditions[condition.condition_group]) {
          groupedConditions[condition.condition_group] = {
            params: [],
            show: condition.show_options
          }
        } else {
          // If show_options is the same, keep it; otherwise this shouldn't happen in well-formed data
          if (JSON.stringify(groupedConditions[condition.condition_group].show) !== JSON.stringify(condition.show_options)) {
            console.warn(`Condition group ${condition.condition_group} has different show_options arrays`)
          }
        }
        groupedConditions[condition.condition_group].params.push({
          section: condition.required_section,
          options: condition.required_options
        })
      })

      return Object.values(groupedConditions)
    })
  }

  /**
   * Get complete section data including options and conditions
   */
  async getCompleteSection(productId, sectionId) {
    const sectionData = await this.getSectionsForProduct(productId)
    const section = sectionData.find(s => s.id === sectionId)
    
    if (!section) return null

    const { options, order } = await this.getOptionsForSection(productId, sectionId)
    const sectionConditions = await this.getSectionConditions(productId, sectionId)
    const optionConditions = await this.getOptionConditions(productId, sectionId)

    return {
      ...section,
      options,
      order,
      section_conditions: sectionConditions,
      option_conditions: optionConditions
    }
  }

  /**
   * Get all sections for a product with complete data
   */
  async getCompleteSectionsForProduct(productId) {
    const sections = await this.getSectionsForProduct(productId)
    
    const completeSections = await Promise.all(
      sections.map(async (section) => {
        const { options, order } = await this.getOptionsForSection(productId, section.id)
        const sectionConditions = await this.getSectionConditions(productId, section.id)
        const optionConditions = await this.getOptionConditions(productId, section.id)

        return {
          ...section,
          options,
          order,
          section_conditions: sectionConditions,
          option_conditions: optionConditions
        }
      })
    )

    return completeSections
  }

  /**
   * Save a user quote (for future use)
   */
  async saveQuote(productId, selections, customValues = {}, userId = null) {
    const { data, error } = await supabase
      .from('quotes')
      .insert([{
        product_type_id: productId,
        selections,
        custom_values: customValues,
        user_id: userId
      }])
      .select()
      .single()

    if (error) {
      console.error('Error saving quote:', error)
      return null
    }

    return data
  }

  /**
   * Load a user quote
   */
  async loadQuote(quoteId) {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single()

    if (error) {
      console.error('Error loading quote:', error)
      return null
    }

    return data
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache() {
    this.cache.clear()
  }
}

// Create singleton instance
export const supabaseDataService = new SupabaseDataService()