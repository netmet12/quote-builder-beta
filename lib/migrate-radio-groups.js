import { supabase } from './supabase.js'
import dataFinal from './data-final.json' with { type: 'json' }

async function migrateRadioGroups() {
  console.log('🔄 Starting radio groups migration...')

  // Clear existing radio group data
  await supabase.from('radio_group_options').delete().neq('id', 0)
  await supabase.from('radio_groups').delete().neq('id', 0)

  let totalGroups = 0
  let totalGroupOptions = 0

  // Process each product type
  for (const [productTypeId, productData] of Object.entries(dataFinal.sections)) {
    console.log(`\n📦 Processing product type ${productTypeId}...`)
    
    if (!productData || typeof productData !== 'object') {
      console.log(`⚠️  Skipping invalid product data for ${productTypeId}`)
      continue
    }

    // Process each section
    for (const [sectionId, sectionData] of Object.entries(productData)) {
      if (!sectionData.radios || !Array.isArray(sectionData.radios)) {
        continue // Skip sections without radio groups
      }

      console.log(`  📋 Section ${sectionId} has ${sectionData.radios.length} radio groups`)

      // Process each radio group in the section
      for (let groupIndex = 0; groupIndex < sectionData.radios.length; groupIndex++) {
        const radioGroup = sectionData.radios[groupIndex]
        
        if (!radioGroup.title || !radioGroup.options) {
          console.log(`    ⚠️  Skipping invalid radio group at index ${groupIndex}`)
          continue
        }

        // Insert radio group
        const { data: groupData, error: groupError } = await supabase
          .from('radio_groups')
          .insert({
            product_type_id: parseInt(productTypeId),
            section_id: parseInt(sectionId),
            title: radioGroup.title,
            allow_multi: radioGroup.allow_multi || false,
            display_order: groupIndex
          })
          .select()
          .single()

        if (groupError) {
          console.error(`    ❌ Failed to insert radio group "${radioGroup.title}":`, groupError)
          continue
        }

        const radioGroupId = groupData.id
        totalGroups++
        
        console.log(`    ✅ Created radio group "${radioGroup.title}" (ID: ${radioGroupId})`)

        // Insert radio group options
        const groupOptions = radioGroup.options.map((optionId, optionIndex) => ({
          radio_group_id: radioGroupId,
          option_id: optionId,
          product_type_id: parseInt(productTypeId),
          section_id: parseInt(sectionId),
          display_order: optionIndex
        }))

        if (groupOptions.length > 0) {
          const { error: optionsError } = await supabase
            .from('radio_group_options')
            .insert(groupOptions)

          if (optionsError) {
            console.error(`    ❌ Failed to insert radio group options:`, optionsError)
          } else {
            console.log(`    ✅ Added ${groupOptions.length} options to radio group`)
            totalGroupOptions += groupOptions.length
          }
        }
      }
    }
  }

  console.log(`\n🎉 Radio groups migration completed!`)
  console.log(`📊 Created ${totalGroups} radio groups with ${totalGroupOptions} total options`)
  
  // Show summary by product type
  const { data: summary } = await supabase
    .from('radio_groups')
    .select('product_type_id')
    .then(({ data }) => {
      const counts = {}
      data?.forEach(group => {
        counts[group.product_type_id] = (counts[group.product_type_id] || 0) + 1
      })
      return { data: counts }
    })

  console.log('\n📈 Radio groups by product type:')
  Object.entries(summary?.data || {}).forEach(([productId, count]) => {
    const productName = dataFinal._types[productId] || `Product ${productId}`
    console.log(`  ${productName}: ${count} radio groups`)
  })
}

migrateRadioGroups().catch(console.error)