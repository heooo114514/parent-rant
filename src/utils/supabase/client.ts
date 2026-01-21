import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const validUrl = url && url.startsWith('http') ? url : 'https://example.supabase.co'
  const validKey = key || 'example-key'

  return createBrowserClient(validUrl, validKey)
}
