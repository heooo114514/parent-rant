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
    <form onSubmit={handleSubmit} className="mb-8 rounded-xl bg-slate-50 p-4">
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
          placeholder="昵称 (可�?"
          className="w-full max-w-[150px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
