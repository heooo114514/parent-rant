import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let validUrl = 'https://example.supabase.co'
  try {
    if (url && url.startsWith('http')) {
      new URL(url)
      validUrl = url
    }
  } catch (e) {
    // Invalid URL, use fallback
  }
  const validKey = key || 'example-key'

  return createBrowserClient(validUrl, validKey)
}
