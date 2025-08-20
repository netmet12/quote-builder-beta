-- Create quote_sessions table to store user progress
CREATE TABLE IF NOT EXISTS quote_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  product_type TEXT NOT NULL,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 1,
  selections JSONB DEFAULT '{}',
  warnings JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quote_sessions_session_id ON quote_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_quote_sessions_created_at ON quote_sessions(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_quote_sessions_updated_at ON quote_sessions;
CREATE TRIGGER update_quote_sessions_updated_at
    BEFORE UPDATE ON quote_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
