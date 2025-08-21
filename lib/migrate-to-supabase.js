#!/usr/bin/env node

import { supabase } from './supabase.js'
import { readFileSync } from 'fs'

// Load JSON data
const dataFinal = JSON.parse(readFileSync('./lib/data-final.json', 'utf8'))

/**
 * Migration script to transform data-final.json into Supabase relational structure
 */

async function migrateData() {
  console.log('🚀 Starting migration to Supabase...')
  console.log('ℹ️  Make sure you\'ve run the run-this-in-supabase.sql file in your Supabase SQL editor first')
  
  try {
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('product_types')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Cannot connect to database. Make sure you ran the SQL schema first:', testError)
      return
    }
    
    console.log('✅ Database connection successful')
    
    // Step 2: Insert product types
    console.log('📦 Migrating product types...')
    const productTypes = Object.entries(dataFinal._types).map(([id, name]) => ({
      id: parseInt(id),
      name,
      key: Object.keys(dataFinal._type_keys).find(key => dataFinal._type_keys[key] === parseInt(id)) || '',
      description: dataFinal._type_descriptions[id] || '',
      image_url: dataFinal._type_images[id] || '',
      section_count: dataFinal._type_sections[id] || 0
    }))
    
    const { error: productTypesError } = await supabase
      .from('product_types')
      .upsert(productTypes)
    
    if (productTypesError) {
      console.error('❌ Error inserting product types:', productTypesError)
      return
    }
    
    console.log(`✅ Migrated ${productTypes.length} product types`)
    
    // Step 3: Process each product's sections and options
    for (const [productTypeId, sections] of Object.entries(dataFinal.sections)) {
      console.log(`📋 Migrating sections for product type ${productTypeId}...`)
      
      const sectionsToInsert = []
      const optionsToInsert = []
      const sectionConditionsToInsert = []
      const optionConditionsToInsert = []
      
      // Process sections
      for (const [sectionId, section] of Object.entries(sections)) {
        sectionsToInsert.push({
          id: parseInt(sectionId),
          product_type_id: parseInt(productTypeId),
          category_id: section.category_id,
          title: section.title,
          tooltip: section.tooltip || '',
          columns: section.columns || 4,
          multi_select: section.multi_select === 1,
          clear_option_id: section.clear || null,
          display_order: parseInt(sectionId)
        })
        
        // Process options for this section
        for (const [optionId, option] of Object.entries(section.options)) {
          const orderIndex = section.order ? section.order.indexOf(parseInt(optionId)) : -1
          
          optionsToInsert.push({
            id: parseInt(optionId),
            product_type_id: parseInt(productTypeId),
            section_id: parseInt(sectionId),
            product_id: option.product_id,
            name: option.name,
            description: option.description || '',
            tooltip: option.tooltip || '',
            primary_image: option.primary_image || '',
            is_most_popular: option.is_most_popular === 1,
            requires_input: option.requires_input === 1,
            display_order: orderIndex >= 0 ? orderIndex : 999
          })
        }
        
        // Process section conditions
        if (section.section_conditions) {
          section.section_conditions.forEach((conditionGroup, groupIndex) => {
            conditionGroup.forEach(condition => {
              // Skip conditions with null or undefined required_section
              if (condition.section != null && condition.section !== undefined) {
                sectionConditionsToInsert.push({
                  product_type_id: parseInt(productTypeId),
                  section_id: parseInt(sectionId),
                  condition_group: groupIndex,
                  required_section: condition.section,
                  required_options: condition.options || [],
                  condition_type: condition.condition || 'IN',
                  allow_null: condition.allow_null === 1
                })
              }
            })
          })
        }
        
        // Process option conditions
        if (section.option_conditions) {
          section.option_conditions.forEach((condition, conditionIndex) => {
            if (condition.params && condition.show) {
              condition.params.forEach((param, paramIndex) => {
                optionConditionsToInsert.push({
                  product_type_id: parseInt(productTypeId),
                  section_id: parseInt(sectionId),
                  condition_group: conditionIndex * 1000 + paramIndex, // Ensure uniqueness
                  required_section: param.section,
                  required_options: param.options,
                  show_options: condition.show
                })
              })
            }
          })
        }
      }
      
      // Insert sections
      if (sectionsToInsert.length > 0) {
        const { error: sectionsError } = await supabase
          .from('sections')
          .upsert(sectionsToInsert)
        
        if (sectionsError) {
          console.error(`❌ Error inserting sections for product ${productTypeId}:`, sectionsError)
          continue
        }
      }
      
      // Insert options
      if (optionsToInsert.length > 0) {
        const { error: optionsError } = await supabase
          .from('options')
          .upsert(optionsToInsert)
        
        if (optionsError) {
          console.error(`❌ Error inserting options for product ${productTypeId}:`, optionsError)
          continue
        }
      }
      
      // Insert section conditions
      if (sectionConditionsToInsert.length > 0) {
        const { error: sectionConditionsError } = await supabase
          .from('section_conditions')
          .upsert(sectionConditionsToInsert)
        
        if (sectionConditionsError) {
          console.error(`❌ Error inserting section conditions for product ${productTypeId}:`, sectionConditionsError)
        }
      }
      
      // Insert option conditions
      if (optionConditionsToInsert.length > 0) {
        const { error: optionConditionsError } = await supabase
          .from('option_conditions')
          .upsert(optionConditionsToInsert)
        
        if (optionConditionsError) {
          console.error(`❌ Error inserting option conditions for product ${productTypeId}:`, optionConditionsError)
        }
      }
      
      console.log(`✅ Product ${productTypeId}: ${sectionsToInsert.length} sections, ${optionsToInsert.length} options, ${sectionConditionsToInsert.length} section conditions, ${optionConditionsToInsert.length} option conditions`)
    }
    
    console.log('🎉 Migration completed successfully!')
    console.log('🔍 Check your Supabase dashboard to verify the data')
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
  }
}

// Run migration
migrateData()