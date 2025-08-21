-- Add radio groups support to handle grouped options
CREATE TABLE radio_groups (
    id SERIAL PRIMARY KEY,
    product_type_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    allow_multi BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link options to radio groups
CREATE TABLE radio_group_options (
    id SERIAL PRIMARY KEY,
    radio_group_id INTEGER NOT NULL REFERENCES radio_groups(id) ON DELETE CASCADE,
    option_id INTEGER NOT NULL,
    product_type_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_radio_groups_product_section ON radio_groups(product_type_id, section_id);
CREATE INDEX idx_radio_group_options_group ON radio_group_options(radio_group_id);
CREATE INDEX idx_radio_group_options_option ON radio_group_options(product_type_id, section_id, option_id);