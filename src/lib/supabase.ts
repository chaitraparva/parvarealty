import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Set these in Vercel → Project → Settings → Environment Variables (and in a local .env file)
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// When the keys are missing (e.g. local preview), the app falls back to browser storage
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null
export const isBackendConfigured = !!supabase
