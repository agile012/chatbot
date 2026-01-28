// Supabase Client Configuration
// Using the global 'supabase' object loaded via script tag in index.html
// This avoids issues with ESM imports from CDNs

const SUPABASE_URL = 'https://lruhvniqyrdngltarfmq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxydWh2bmlxeXJkbmdsdGFyZm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDMzNDcsImV4cCI6MjA3ODM3OTM0N30.dntOb-6eWK8VyF3vqgVYpaGPh5jF5SHxq7g3Q1VcSpo';

let supabase;

try {
    if (window.supabase && window.supabase.createClient) {
        // Configure Supabase to use localStorage instead of cookies
        // This eliminates cookie security vulnerabilities (CWE-16, CWE-614):
        // - HttpOnly flag not needed (no cookies)
        // - Secure flag not needed (no cookies)
        // - SameSite attribute not needed (no cookies)
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                // Use localStorage for session storage instead of cookies
                storage: window.localStorage,
                storageKey: 'supabase-auth-token',
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
        console.log('Supabase client initialized with localStorage storage');
    } else {
        console.error('Supabase library not found on window object');
        // Fallback or mock to prevent crash, though functionality will be limited
        supabase = {
            auth: {
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                signInWithOAuth: () => Promise.resolve({ error: new Error('Supabase not initialized') }),
                signOut: () => Promise.resolve({ error: null })
            },
            from: () => ({
                select: () => ({
                    eq: () => ({
                        order: () => Promise.resolve({ data: [], error: null }),
                        single: () => Promise.resolve({ data: null, error: null })
                    }),
                    order: () => Promise.resolve({ data: [], error: null })
                }),
                insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
                update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
                delete: () => ({ eq: () => Promise.resolve({ error: null }) })
            })
        };
    }
} catch (error) {
    console.error('Error initializing Supabase client:', error);
}

export default supabase;
