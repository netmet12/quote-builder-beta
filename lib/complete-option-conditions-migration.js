#!/usr/bin/env node

import { supabase } from './supabase.js'
import { readFileSync } from 'fs'

// Load JSON data
const dataFinal = JSON.parse(readFileSync('./lib/data-final.json', 'utf8'))

/**
 * Complete option conditions migration with all missing fields
 * 
 * PREREQUISITE: Run fix-option-conditions-schema.sql in Supabase SQL Editor first!
 */

async function completeOptionConditionsMigration() {
  console.log('🔧 Complete option conditions migration with missing fields...')
  console.log('⚠️  Make sure you ran fix-option-conditions-schema.sql first!')
  
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

    // Re-insert with ALL fields including condition_type and allow_null
    let totalConditions = 0
    
    for (const [productTypeId, sections] of Object.entries(dataFinal.sections)) {
      console.log(`🔄 Migrating complete option conditions for product type ${productTypeId}...`)
      
      const optionConditionsToInsert = []
      
      for (const [sectionId, section] of Object.entries(sections)) {
        if (section.option_conditions) {
          section.option_conditions.forEach((condition, conditionIndex) => {
            if (condition.params && condition.show) {
              // All params in this condition should have the SAME condition_group
              condition.params.forEach(param => {
                const conditionRecord = {
                  product_type_id: parseInt(productTypeId),
                  section_id: parseInt(sectionId),
                  condition_group: conditionIndex, // Same group for all params
                  required_section: param.section,
                  required_options: param.options || [],
                  show_options: condition.show,
                  condition_type: param.condition || 'IN', // ✅ NOW CAPTURING
                  allow_null: param.allow_null === 1       // ✅ NOW CAPTURING
                }
                
                optionConditionsToInsert.push(conditionRecord)
              })
            }
          })
        }
      }
      
      // Insert complete option conditions
      if (optionConditionsToInsert.length > 0) {
        const { error: optionConditionsError } = await supabase
          .from('option_conditions')
          .insert(optionConditionsToInsert)
        
        if (optionConditionsError) {
          console.error(`❌ Error inserting option conditions for product ${productTypeId}:`, optionConditionsError)
          console.error('Error details:', optionConditionsError)
        } else {
          console.log(`✅ Migrated ${optionConditionsToInsert.length} complete option conditions for product ${productTypeId}`)
          totalConditions += optionConditionsToInsert.length
        }
      }
    }
    
    console.log('🎉 Complete option conditions migration finished!')
    console.log(`📊 Total conditions migrated: ${totalConditions}`)
    console.log('🔍 Now supports:')
    console.log('   ✅ allow_null conditions (fire rating with no selection)')
    console.log('   ✅ condition_type: NOT, NOT_MULTI (exclusion logic)')
    console.log('   ✅ condition_type: IN (inclusion logic)')
    console.log('   ✅ Proper condition grouping (AND within groups)')
    
  } catch (error) {
    console.error('💥 Complete migration failed:', error)
  }
}

// Run complete migration
completeOptionConditionsMigration()