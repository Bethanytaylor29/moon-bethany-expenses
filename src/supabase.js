import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gofphernjjjdmamtnjkv.supabase.co'

const supabaseAnonKey = 'sb_publishable_9rb8xhKPhne9BfAdd0FJ-g_RcDrXMNI'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)