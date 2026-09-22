import { createClient } from '@supabase/supabase-js'

// ⚠️ Reemplaza estos dos valores con los de TU proyecto de Supabase si cambian
// (Supabase Dashboard → Project Settings → API)
export const SUPABASE_URL = 'https://hgvzjqokaggiyjpmjkec.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhndnpqcW9rYWdnaXlqcG1qa2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMjc3MTEsImV4cCI6MjEwNTYwMzcxMX0.nFsIYxJPIM7cwMxJ-ARoNdICoTejSg1vgVw3zo9J_J8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
