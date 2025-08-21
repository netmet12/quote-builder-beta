import { supabaseDataService } from './supabase-data-service.js'

/**
 * Supabase-based configuration system
 * Replaces the JSON-based simple-config.js with database queries
 */

// Cache for API compatibility
let cachedProductTypes = null
let cachedSections = {}

export async function getProductTypes() {
  if (!cachedProductTypes) {
    cachedProductTypes = await supabaseDataService.getProductTypes()
  }
  return cachedProductTypes
}

export async function getSectionsForProduct(productId) {
  if (!cachedSections[productId]) {
    cachedSections[productId] = await supabaseDataService.getCompleteSectionsForProduct(productId)
  }
  return cachedSections[productId]
}

// For API compatibility, maintain the same interface
export const quoteConfig = {
  async getProductTypes() {
    return await getProductTypes()
  },
  
  async getSectionsForProduct(productId) {
    return await getSectionsForProduct(productId)
  }
}

// Legacy synchronous functions that now throw helpful errors
export function checkConditions() {
  throw new Error('checkConditions is deprecated. Use the rules engine with Supabase data.')
}

export function getVisibleOptions() {
  throw new Error('getVisibleOptions is deprecated. Use the rules engine with Supabase data.')
}