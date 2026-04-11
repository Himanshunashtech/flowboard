import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mzfiavwxtjooevevowuv.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16Zmlhdnd4dGpvb2V2ZXZvd3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3ODgwMjMsImV4cCI6MjA5MTM2NDAyM30.NsexD2nZwYAaqGOMwNi9znsbxN-oLxQeCUlwkD-Aq8A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
