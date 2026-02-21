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
        // In production, throw hard to prevent silent misconfiguration
        const msg = '⚠️ SUPABASE NOT CONFIGURED — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
        if (import.meta.env.PROD) {
            throw new Error(msg)
        }
        console.error(msg)
        // In dev, fall back to a dummy client so the app can at least render
        return createClient('https://placeholder.supabase.co', 'placeholder-key')
    }
    return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()
