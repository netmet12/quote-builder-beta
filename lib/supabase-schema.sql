-- Quote Builder Database Schema for Supabase
-- This schema transforms the flat JSON structure into normalized relational tables

-- Product Types (e.g., Metal Door, Wood Door, etc.)
CREATE TABLE product_types (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    key TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    section_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sections within each product type
CREATE TABLE sections (
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

-- Options within each section
CREATE TABLE options (
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

-- Section conditions (when to show/hide sections)
CREATE TABLE section_conditions (
    id SERIAL PRIMARY KEY,
    product_type_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    condition_group INTEGER NOT NULL, -- Groups conditions with OR logic
    required_section INTEGER NOT NULL,
    required_options INTEGER[] NOT NULL,
    condition_type TEXT NOT NULL DEFAULT 'IN', -- IN, NOT, NOT_MULTI
    allow_null BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (product_type_id, section_id) REFERENCES sections(product_type_id, id) ON DELETE CASCADE
);

-- Option conditions (when to show/hide specific options)
CREATE TABLE option_conditions (
    id SERIAL PRIMARY KEY,
    product_type_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    condition_group INTEGER NOT NULL, -- Groups parameters with AND logic
    required_section INTEGER NOT NULL,
    required_options INTEGER[] NOT NULL,
    show_options INTEGER[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (product_type_id, section_id) REFERENCES sections(product_type_id, id) ON DELETE CASCADE
);

-- User quotes (for future use)
CREATE TABLE quotes (
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

-- Indexes for performance
CREATE INDEX idx_sections_product_type ON sections(product_type_id);
CREATE INDEX idx_options_section ON options(product_type_id, section_id);
CREATE INDEX idx_section_conditions_section ON section_conditions(product_type_id, section_id);
CREATE INDEX idx_option_conditions_section ON option_conditions(product_type_id, section_id);
CREATE INDEX idx_quotes_user ON quotes(user_id);
CREATE INDEX idx_quotes_product_type ON quotes(product_type_id);

-- Enable Row Level Security (optional)
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Public read access for product data (since it's the same for all users)
CREATE POLICY "Public read access" ON product_types FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read access" ON sections FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read access" ON options FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read access" ON section_conditions FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read access" ON option_conditions FOR SELECT TO PUBLIC USING (true);

-- User-specific access for quotes
CREATE POLICY "Users can manage own quotes" ON quotes FOR ALL TO PUBLIC USING (auth.uid() = user_id OR user_id IS NULL);