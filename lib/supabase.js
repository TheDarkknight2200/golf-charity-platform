import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client pour les composants client (stocke la session dans les cookies)
export const supabase = createBrowserClient(supabaseUrl, supabaseKey)

// Client basique pour les cas simples
export const supabaseClient = createClient(supabaseUrl, supabaseKey)