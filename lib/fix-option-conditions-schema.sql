-- Add missing columns to option_conditions table
-- Run this in your Supabase SQL Editor

ALTER TABLE option_conditions ADD COLUMN IF NOT EXISTS condition_type TEXT NOT NULL DEFAULT 'IN';
ALTER TABLE option_conditions ADD COLUMN IF NOT EXISTS allow_null BOOLEAN DEFAULT FALSE;