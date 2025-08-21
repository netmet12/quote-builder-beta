#!/usr/bin/env node

import { supabase } from './supabase.js'
import fs from 'fs'

async function createSchema() {
  console.log('📋 Creating database schema...')
  
  try {
    // Read the SQL schema file
    const schema = fs.readFileSync('./lib/supabase-schema.sql', 'utf8')
    
    // Split by statements and execute each one
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0)
    
    for (const statement of statements) {
      const trimmed = statement.trim()
      if (trimmed.length > 0) {
        console.log('Executing:', trimmed.substring(0, 50) + '...')
        
        const { error } = await supabase.rpc('exec_sql', { sql: trimmed })
        
        if (error) {
          console.error('❌ Error executing statement:', error)
          console.log('Statement was:', trimmed)
        }
      }
    }
    
    console.log('✅ Schema creation completed!')
    
  } catch (error) {
    console.error('💥 Schema creation failed:', error)
  }
}

createSchema()