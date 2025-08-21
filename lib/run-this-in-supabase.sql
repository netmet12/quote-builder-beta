-- Run this SQL in your Supabase SQL Editor
-- Go to: https://pvlpxysjcwuercsohvua.supabase.co/project/pvlpxysjcwuercsohvua/sql

-- Product Types table
CREATE TABLE IF NOT EXISTS product_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  section_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sections table
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

-- Options table
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

-- Section conditions table
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

-- Option conditions table
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

-- Quotes table (for future use)
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  product_type_id INTEGER NOT NULL,
  selections JSONB NOT NULL DEFAULT '{}',
  custom_values JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sections_product_type ON sections(product_type_id);
CREATE INDEX IF NOT EXISTS idx_options_section ON options(product_type_id, section_id);
CREATE INDEX IF NOT EXISTS idx_section_conditions_section ON section_conditions(product_type_id, section_id);
CREATE INDEX IF NOT EXISTS idx_option_conditions_section ON option_conditions(product_type_id, section_id);
CREATE INDEX IF NOT EXISTS idx_quotes_user ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_product_type ON quotes(product_type_id);

-- Enable Row Level Security (optional)
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to product data
CREATE POLICY IF NOT EXISTS "Public read access" ON product_types FOR SELECT TO PUBLIC USING (true);
CREATE POLICY IF NOT EXISTS "Public read access" ON sections FOR SELECT TO PUBLIC USING (true);
CREATE POLICY IF NOT EXISTS "Public read access" ON options FOR SELECT TO PUBLIC USING (true);
CREATE POLICY IF NOT EXISTS "Public read access" ON section_conditions FOR SELECT TO PUBLIC USING (true);
CREATE POLICY IF NOT EXISTS "Public read access" ON option_conditions FOR SELECT TO PUBLIC USING (true);

-- Users can manage own quotes (when auth is implemented)
CREATE POLICY IF NOT EXISTS "Users can manage own quotes" ON quotes FOR ALL TO PUBLIC USING (auth.uid() = user_id OR user_id IS NULL);