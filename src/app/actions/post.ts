'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Category } from '@/types'
import { headers, cookies } from 'next/headers'

const MAX_CONTENT_LENGTH = 10000
const MAX_NICKNAME_LENGTH = 50

interface CreatePostResult {
  success: boolean
  message: string
}

interface CreatePostData {
  content: string
  nickname: string
  category: string
  color: string
  imageUrl?: string | null
}

export async function createPost(data: CreatePostData): Promise<CreatePostResult> {
  const { content, nickname, category, color, imageUrl } = data

  // 1. Validation (Safety Check)
  if (!content || !content.trim()) {
    return { success: false, message: '写点啥啊？空气没法吐槽！' }
  }

  // Strip HTML tags to check text length (rough approximation)
  const textContent = content.replace(/<[^>]*>?/gm, '')
  if (textContent.length === 0 && !content.includes('<img')) {
     return { success: false, message: '不能只发空行，说点人话！' }
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return { success: false, message: '太长不看！你也太能唠叨了吧？请控制在 1万字以内。' }
  }

  if (nickname && nickname.length > MAX_NICKNAME_LENGTH) {
    return { success: false, message: '江湖代号太长了，简短点才霸气！' }
  }

  // 1.5 Check for IP Ban
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const supabase = await createClient()

  // Dev Bypass Check
  const cookieStore = await cookies()
  const isBypass = process.env.NODE_ENV === 'development' && cookieStore.get('x-dev-bypass')?.value === 'true'

  if (ip !== 'unknown' && !isBypass) {
    const { data: bannedIp } = await supabase
      .from('banned_ips')
      .select('id')
      .eq('ip_address', ip)
      .single()
    
    if (bannedIp) {
      return { success: false, message: '哎呀，您的小黑屋套餐还没到期呢，暂时不能发言哦~' }
    }
  }

  // 2. Database Insertion
  const { data: { user } } = await supabase.auth.getUser()

  try {
    const { error } = await supabase
      .from('posts')
      .insert([
        {
          content, // Tiptap HTML content
          nickname: nickname || '匿名家长',
          color: color || 'blue',
          category: category || 'other',
          image_url: imageUrl || null,
          user_id: user?.id || null,
          ip_address: ip
        }
      ])

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, message: '发射失败！服务器可能被你的怨气冲坏了...' }
    }

    revalidatePath('/')
    return { success: true, message: '吐槽发射成功！舒服了！' }
  } catch (error) {
    console.error('Server error:', error)
    return { success: false, message: '未知错误，可能是外星人干扰了信号。' }
  }
}
