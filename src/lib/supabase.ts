import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function createSupabaseClient(): SupabaseClient {
    // Validate URL — createClient throws if it's not a valid HTTP(S) URL
    try {
        const url = new URL(supabaseUrl)
        if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error('Invalid protocol')
        }
    } catch {
        console.error(
            '⚠️ SUPABASE NOT CONFIGURED — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
        )
        // Create a client with a dummy URL so the app can at least render;
        // all Supabase calls will fail gracefully.
        return createClient('https://placeholder.supabase.co', 'placeholder-key')
    }
    return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()

