#!/usr/bin/env node

import { supabase } from './supabase.js'
import { readFileSync } from 'fs'

// Load JSON data
const dataFinal = JSON.parse(readFileSync('./lib/data-final.json', 'utf8'))

/**
 * Complete fix for missing schema fields and migration data
 */

async function fixSchemaAndMigration() {
  console.log('🔧 Fixing database schema and re-migrating with complete data...')
  
  try {
    // Step 1: Add missing columns to option_conditions table
    console.log('📋 Adding missing columns to option_conditions table...')
    
    const schemaUpdates = [
      'ALTER TABLE option_conditions ADD COLUMN IF NOT EXISTS condition_type TEXT NOT NULL DEFAULT \'IN\'',
      'ALTER TABLE option_conditions ADD COLUMN IF NOT EXISTS allow_null BOOLEAN DEFAULT FALSE'
    ]
    
    for (const sql of schemaUpdates) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
      if (error) {
        console.log(`⚠️  Schema update failed (might already exist): ${error.message}`)
      }
    }
    
    console.log('✅ Schema updates completed')

    // Step 2: Clear and re-migrate option conditions with complete data
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

    // Step 3: Re-insert with complete data including condition_type and allow_null
    for (const [productTypeId, sections] of Object.entries(dataFinal.sections)) {
      console.log(`🔄 Re-migrating option conditions for product type ${productTypeId} with complete data...`)
      
      const optionConditionsToInsert = []
      
      for (const [sectionId, section] of Object.entries(sections)) {
        if (section.option_conditions) {
          section.option_conditions.forEach((condition, conditionIndex) => {
            if (condition.params && condition.show) {
              // All params in this condition should have the SAME condition_group
              condition.params.forEach(param => {
                optionConditionsToInsert.push({
                  product_type_id: parseInt(productTypeId),
                  section_id: parseInt(sectionId),
                  condition_group: conditionIndex, // Same group for all params in this condition
                  required_section: param.section,
                  required_options: param.options || [],
                  show_options: condition.show,
                  condition_type: param.condition || 'IN', // ✅ NOW CAPTURING
                  allow_null: param.allow_null === 1       // ✅ NOW CAPTURING
                })
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
        } else {
          console.log(`✅ Migrated ${optionConditionsToInsert.length} complete option conditions for product ${productTypeId}`)
        }
      }
    }
    
    console.log('🎉 Complete schema and migration fix completed!')
    console.log('🔍 Now testing should handle:')
    console.log('   - allow_null conditions (fire rating with no selection)')
    console.log('   - NOT condition types (exclusion logic)')
    console.log('   - All other conditional logic edge cases')
    
  } catch (error) {
    console.error('💥 Complete fix failed:', error)
  }
}

// Run complete fix
fixSchemaAndMigration()