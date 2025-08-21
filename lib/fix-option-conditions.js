#!/usr/bin/env node

import { supabase } from './supabase.js'
import { readFileSync } from 'fs'

// Load JSON data
const dataFinal = JSON.parse(readFileSync('./lib/data-final.json', 'utf8'))

/**
 * Fix option conditions migration - the original migration broke apart 
 * condition groups incorrectly
 */

async function fixOptionConditions() {
  console.log('🔧 Fixing option conditions migration...')
  
  try {
    // Clear existing option conditions
    console.log('🗑️  Clearing existing option conditions...')
    const { error: deleteError } = await supabase
      .from('option_conditions')
      .delete()
      .neq('id', 0) // Delete all rows
    
    if (deleteError) {
      console.error('❌ Error deleting option conditions:', deleteError)
      return
    }
    
    console.log('✅ Cleared existing option conditions')

    // Re-insert with correct grouping
    for (const [productTypeId, sections] of Object.entries(dataFinal.sections)) {
      console.log(`🔄 Fixing option conditions for product type ${productTypeId}...`)
      
      const optionConditionsToInsert = []
      
      for (const [sectionId, section] of Object.entries(sections)) {
        if (section.option_conditions) {
          section.option_conditions.forEach((condition, conditionIndex) => {
            if (condition.params && condition.show) {
              // All params in this condition should have the SAME condition_group
              // because they are AND conditions
              condition.params.forEach(param => {
                optionConditionsToInsert.push({
                  product_type_id: parseInt(productTypeId),
                  section_id: parseInt(sectionId),
                  condition_group: conditionIndex, // Same group for all params in this condition
                  required_section: param.section,
                  required_options: param.options || [],
                  show_options: condition.show
                })
              })
            }
          })
        }
      }
      
      // Insert corrected option conditions
      if (optionConditionsToInsert.length > 0) {
        const { error: optionConditionsError } = await supabase
          .from('option_conditions')
          .insert(optionConditionsToInsert)
        
        if (optionConditionsError) {
          console.error(`❌ Error inserting option conditions for product ${productTypeId}:`, optionConditionsError)
        } else {
          console.log(`✅ Fixed ${optionConditionsToInsert.length} option conditions for product ${productTypeId}`)
        }
      }
    }
    
    console.log('🎉 Option conditions fix completed!')
    console.log('🔍 Test the Wall Thickness section now - Steel Stud should only show steel options')
    
  } catch (error) {
    console.error('💥 Fix failed:', error)
  }
}

// Run fix
fixOptionConditions()