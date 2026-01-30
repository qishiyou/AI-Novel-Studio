import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 如果在构建过程中缺少环境变量，抛出错误提示
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Anon Key. Please check your .env.local or Netlify environment variables.')
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
