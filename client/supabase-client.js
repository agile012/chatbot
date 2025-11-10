// Supabase Client Configuration
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://lruhvniqyrdngltarfmq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxydWh2bmlxeXJkbmdsdGFyZm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDMzNDcsImV4cCI6MjA3ODM3OTM0N30.dntOb-6eWK8VyF3vqgVYpaGPh5jF5SHxq7g3Q1VcSpo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
