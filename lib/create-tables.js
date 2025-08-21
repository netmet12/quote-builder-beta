#!/usr/bin/env node

import { supabase } from './supabase.js'

async function createTables() {
  console.log('🏗️  Creating database tables directly...')
  
  try {
    // Product Types table
    console.log('Creating product_types table...')
    let { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS product_types (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          key TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          section_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (error) console.error('product_types error:', error)
    
    // Sections table
    console.log('Creating sections table...')
    ;({ error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS sections (
          product_type_id INTEGER NOT NULL,
          id INTEGER NOT NULL,
          category_id INTEGER,
          title TEXT NOT NULL,
          tooltip TEXT DEFAULT '',
          columns INTEGER DEFAULT 4,
          multi_select BOOLEAN DEFAULT FALSE,
          clear_option_id INTEGER,
          display_order INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (product_type_id, id)
        );
      `
    }))
    if (error) console.error('sections error:', error)
    
    // Options table
    console.log('Creating options table...')
    ;({ error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS options (
          product_type_id INTEGER NOT NULL,
          section_id INTEGER NOT NULL,
          id INTEGER NOT NULL,
          product_id INTEGER,
          name TEXT NOT NULL,
          description TEXT DEFAULT '',
          tooltip TEXT DEFAULT '',
          primary_image TEXT DEFAULT '',
          is_most_popular BOOLEAN DEFAULT FALSE,
          requires_input BOOLEAN DEFAULT FALSE,
          display_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (product_type_id, section_id, id)
        );
      `
    }))
    if (error) console.error('options error:', error)
    
    // Section conditions table
    console.log('Creating section_conditions table...')
    ;({ error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS section_conditions (
          id BIGSERIAL PRIMARY KEY,
          product_type_id INTEGER NOT NULL,
          section_id INTEGER NOT NULL,
          condition_group INTEGER NOT NULL,
          required_section INTEGER NOT NULL,
          required_options INTEGER[] NOT NULL,
          condition_type TEXT NOT NULL DEFAULT 'IN',
          allow_null BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }))
    if (error) console.error('section_conditions error:', error)
    
    // Option conditions table
    console.log('Creating option_conditions table...')
    ;({ error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS option_conditions (
          id BIGSERIAL PRIMARY KEY,
          product_type_id INTEGER NOT NULL,
          section_id INTEGER NOT NULL,
          condition_group INTEGER NOT NULL,
          required_section INTEGER NOT NULL,
          required_options INTEGER[] NOT NULL,
          show_options INTEGER[] NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }))
    if (error) console.error('option_conditions error:', error)
    
    console.log('✅ All tables created successfully!')
    
  } catch (error) {
    console.error('💥 Error creating tables:', error)
  }
}

createTables()