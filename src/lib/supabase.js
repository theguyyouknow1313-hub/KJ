import { createClient } from '@supabase/supabase-js'

// Pull environment variables configured by Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Provide a console warning if the .env file is missing or not loaded
if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'Missing Supabase environment variables! Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
    )
}

// Export the singleton client instance to be used across the app
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')