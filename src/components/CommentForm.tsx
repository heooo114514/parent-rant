'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send } from 'lucide-react'
import MarkdownEditor from './MarkdownEditor'
import { toast } from 'sonner'
import { createComment } from '@/app/actions/comment'

interface CommentFormProps {
  postId: string
}

export default function CommentForm({ postId }: CommentFormProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [nickname, setNickname] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)

    try {
      const result = await createComment({
        postId,
        content,
        nickname
      })

      if (!result.success) {
        toast.error(result.message)
        return
      }

      setContent('')
      router.refresh()
      toast.success(result.message)
    } catch (error) {
      console.error('Error creating comment:', error)
      toast.error('评论失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 border-2 border-black bg-[#f0f0f0] p-4 shadow-[4px_4px_0_0_black]">
      <div className="mb-3">
        <MarkdownEditor
          content={content}
          onChange={setContent}
          placeholder="写下你的看法..."
        />
      </div>
      
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="昵称 (可选)"
          className="w-full max-w-[150px] border-2 border-black px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:bg-[var(--primary-color)] focus:outline-none focus:ring-0 font-bold"
        />
        
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="inline-flex items-center gap-2 border-2 border-black bg-black px-4 py-2 text-sm font-black text-white transition-all hover:bg-[var(--primary-color)] hover:text-black hover:shadow-[2px_2px_0_0_black] disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send size={16} />
              <span>评论</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
