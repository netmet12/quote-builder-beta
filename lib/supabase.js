import { createClient } from '@supabase/supabase-js'

// Supabase project configuration
const supabaseUrl = 'https://pvlpxysjcwuercsohvua.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bHB4eXNqY3d1ZXJjc29odnVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTc0MjQwMCwiZXhwIjoyMDcxMzE4NDAwfQ.OS-hq_3FyxRAqCIv_hlKRug72Q-3AUQq7W-wsP-QqZY'

// Using service key for admin operations (data migration)
export const supabase = createClient(supabaseUrl, supabaseServiceKey)