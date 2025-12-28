const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL or Service Key is missing');
  console.error('Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in environment variables');
  // Fail fast so the server doesn't run with insecure configuration
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
}

// Use service role key for server-side operations (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
