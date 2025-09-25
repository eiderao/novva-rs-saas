// src/supabase/client.js
import { createClient } from '@supabase/supabase-js'

// Busca as variáveis de ambiente que configuramos na Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cria e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)