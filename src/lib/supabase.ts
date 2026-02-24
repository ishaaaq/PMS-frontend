import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
    const msg = '⚠️ SUPABASE NOT CONFIGURED — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
    if (import.meta.env.PROD) {
        throw new Error(msg)
    }
    console.error(msg)
}

export const supabase = createClient(
    supabaseUrl ?? 'https://placeholder.supabase.co',
    supabaseAnonKey ?? 'placeholder-key'
)
