#!/usr/bin/env node

import { supabase } from './supabase.js'

async function setupDatabase() {
  console.log('🏗️  Setting up database tables...')
  
  try {
    // Create tables using raw SQL execution
    const createTablesSQL = `
      -- Product Types
      CREATE TABLE IF NOT EXISTS product_types (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          key TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          section_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Sections
      CREATE TABLE IF NOT EXISTS sections (
          id INTEGER NOT NULL,
          product_type_id INTEGER NOT NULL,
          category_id INTEGER,
          title TEXT NOT NULL,
          tooltip TEXT,
          columns INTEGER DEFAULT 4,
          multi_select BOOLEAN DEFAULT FALSE,
          clear_option_id INTEGER,
          display_order INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (product_type_id, id),
          FOREIGN KEY (product_type_id) REFERENCES product_types(id) ON DELETE CASCADE
      );

      -- Options
      CREATE TABLE IF NOT EXISTS options (
          id INTEGER NOT NULL,
          product_type_id INTEGER NOT NULL,
          section_id INTEGER NOT NULL,
          product_id INTEGER,
          name TEXT NOT NULL,
          description TEXT,
          tooltip TEXT,
          primary_image TEXT,
          is_most_popular BOOLEAN DEFAULT FALSE,
          requires_input BOOLEAN DEFAULT FALSE,
          display_order INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (product_type_id, section_id, id),
          FOREIGN KEY (product_type_id, section_id) REFERENCES sections(product_type_id, id) ON DELETE CASCADE
      );

      -- Section Conditions
      CREATE TABLE IF NOT EXISTS section_conditions (
          id SERIAL PRIMARY KEY,
          product_type_id INTEGER NOT NULL,
          section_id INTEGER NOT NULL,
          condition_group INTEGER NOT NULL,
          required_section INTEGER NOT NULL,
          required_options INTEGER[] NOT NULL,
          condition_type TEXT NOT NULL DEFAULT 'IN',
          allow_null BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          FOREIGN KEY (product_type_id, section_id) REFERENCES sections(product_type_id, id) ON DELETE CASCADE
      );

      -- Option Conditions
      CREATE TABLE IF NOT EXISTS option_conditions (
          id SERIAL PRIMARY KEY,
          product_type_id INTEGER NOT NULL,
          section_id INTEGER NOT NULL,
          condition_group INTEGER NOT NULL,
          required_section INTEGER NOT NULL,
          required_options INTEGER[] NOT NULL,
          show_options INTEGER[] NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          FOREIGN KEY (product_type_id, section_id) REFERENCES sections(product_type_id, id) ON DELETE CASCADE
      );

      -- Quotes
      CREATE TABLE IF NOT EXISTS quotes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          product_type_id INTEGER NOT NULL,
          selections JSONB NOT NULL DEFAULT '{}',
          custom_values JSONB NOT NULL DEFAULT '{}',
          status TEXT DEFAULT 'draft',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          FOREIGN KEY (product_type_id) REFERENCES product_types(id)
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_sections_product_type ON sections(product_type_id);
      CREATE INDEX IF NOT EXISTS idx_options_section ON options(product_type_id, section_id);
      CREATE INDEX IF NOT EXISTS idx_section_conditions_section ON section_conditions(product_type_id, section_id);
      CREATE INDEX IF NOT EXISTS idx_option_conditions_section ON option_conditions(product_type_id, section_id);
      CREATE INDEX IF NOT EXISTS idx_quotes_user ON quotes(user_id);
      CREATE INDEX IF NOT EXISTS idx_quotes_product_type ON quotes(product_type_id);
    `

    const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL })
    
    if (error) {
      console.error('❌ Error creating tables:', error)
      return
    }
    
    console.log('✅ Database tables created successfully!')
    
  } catch (error) {
    console.error('💥 Database setup failed:', error)
  }
}

setupDatabase()