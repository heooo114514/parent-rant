'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const MAX_CONTENT_LENGTH = 2000
const MAX_NICKNAME_LENGTH = 50

interface CreateCommentResult {
  success: boolean
  message: string
}

interface CreateCommentData {
  postId: string
  content: string
  nickname: string
}

export async function createComment(data: CreateCommentData): Promise<CreateCommentResult> {
  const { postId, content, nickname } = data

  // 1. Validation
  if (!content || !content.trim()) {
    return { success: false, message: '说点啥啊？哑语是没法交流的！' }
  }

  // Strip HTML tags to check text length
  const textContent = content.replace(/<[^>]*>?/gm, '')
  if (textContent.length === 0) {
     return { success: false, message: '别光发表情包或者空行，打两个字呗！' }
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return { success: false, message: '评论区不是写作文的地方，精简点！' }
  }

  if (nickname && nickname.length > MAX_NICKNAME_LENGTH) {
    return { success: false, message: '名字太长了，你是来写小说的吗？' }
  }

  // 2. Database Insertion
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          content,
          nickname: nickname || '匿名',
        }
      ])

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, message: '评论失败！服务器可能在摸鱼。' }
    }

    revalidatePath(`/post/${postId}`)
    return { success: true, message: '评论发布成功！怼得好！' }
  } catch (error) {
    console.error('Server error:', error)
    return { success: false, message: '未知错误，可能是水逆了。' }
  }
}
