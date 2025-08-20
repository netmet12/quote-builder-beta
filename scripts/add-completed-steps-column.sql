-- Add missing completed_steps column to quote_sessions table
ALTER TABLE quote_sessions 
ADD COLUMN IF NOT EXISTS completed_steps JSONB DEFAULT '[]';

-- Update existing records to have empty completed_steps array
UPDATE quote_sessions 
SET completed_steps = '[]' 
WHERE completed_steps IS NULL;
