import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xizkneeohymoxlsqjvuh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpemtuZWVvaHltb3hsc3FqdnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5OTU5MTksImV4cCI6MjEwMTU3MTkxOX0.64imsI0fOw1L9AZEh9iV47wf9aF71vuIQaQE3n6Idv0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)