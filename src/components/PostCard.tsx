'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Post, CATEGORY_LABELS } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Heart, MessageCircle, Share2, Check, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import MarkdownRenderer from './MarkdownRenderer'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import ReportModal from './ReportModal'

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-100 text-blue-900',
  green: 'bg-emerald-50 border-emerald-100 text-emerald-900',
  purple: 'bg-purple-50 border-purple-100 text-purple-900',
  orange: 'bg-orange-50 border-orange-100 text-orange-900',
  pink: 'bg-pink-50 border-pink-100 text-pink-900',
  gray: 'bg-white border-slate-200 text-slate-900',
}

interface PostCardProps {
  post: Post
  truncate?: boolean
}

export default function PostCard({ post: initialPost, truncate = true }: PostCardProps) {
  const [post, setPost] = useState(initialPost)
  const [isLiking, setIsLiking] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const colorClass = colorMap[post.color] || colorMap.gray

  // Safe date formatting
  const timeAgo = (() => {
    try {
      if (!post.created_at) return '刚刚'
      return formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: zhCN })
    } catch (e) {
      return '刚刚'
    }
  })()

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLiking) return
    setIsLiking(true)

    setPost(prev => ({ ...prev, likes: prev.likes + 1 }))

    try {
      const { error } = await supabase.rpc('increment_likes', { post_id: post.id })
      
      if (error) {
         const { data, error: updateError } = await supabase
           .from('posts')
           .update({ likes: post.likes + 1 })
           .eq('id', post.id)
           .select()
           .single()
         
         if (updateError) throw updateError
         if (data) setPost(data as Post)
      }
    } catch (error) {
      console.error('Error liking post:', error)
      setPost(prev => ({ ...prev, likes: prev.likes - 1 }))
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const url = `${window.location.origin}/post/${post.id}`
    const shareData = {
      title: 'ParentRant: 爸妈吐槽大会',
      text: post.content.substring(0, 50) + '...',
      url: url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(url)
        setIsCopied(true)
        toast.success('链接已复制，快去群里挂人！')
        setTimeout(() => setIsCopied(false), 2000)
      }
    } catch (err) {
      console.error('Share failed:', err)
    }
  }

  const Content = (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex h-full flex-col rounded-xl border p-6 shadow-sm transition-all hover:shadow-md relative group", truncate && "hover:-translate-y-1", colorClass)}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-white/50 px-2 py-0.5 text-xs font-medium opacity-70">
          {CATEGORY_LABELS[post.category] || '其他'}
        </span>
        <button 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsReportModalOpen(true)
          }}
          className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
          title="举报"
        >
          <Flag size={14} />
        </button>
      </div>
      
      <div className="mb-4 text-base leading-relaxed">
        <MarkdownRenderer content={post.content} limitHeight={truncate} />
        {post.image_url && (
          <div className="mt-4">
            <img 
              src={post.image_url} 
              alt="Post attachment" 
              className="max-h-96 w-full rounded-lg object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>
      
      <div className="mt-auto flex items-center justify-between text-sm opacity-80">
        <div className="flex flex-col">
          <span className="font-semibold">{post.nickname || '匿名家长'}</span>
          <span className="text-xs">
            {timeAgo}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={handleShare}
            className="flex items-center gap-1 rounded-full bg-white/50 px-3 py-1.5 transition-colors hover:bg-white/80 active:scale-95"
            title="分享吐槽"
          >
            <AnimatePresence mode='wait'>
              {isCopied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check size={16} className="text-green-600" />
                </motion.div>
              ) : (
                <motion.div
                  key="share"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Share2 size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-1 rounded-full bg-white/50 px-3 py-1.5 transition-colors hover:bg-white/80 active:scale-95 disabled:opacity-50"
          >
            <Heart size={16} className={cn("transition-colors", post.likes > 0 ? "fill-red-500 text-red-500" : "")} />
            <span className="min-w-[1ch] text-center">{post.likes}</span>
          </motion.button>
          
          <div className="flex items-center gap-1 rounded-full bg-white/50 px-3 py-1.5">
            <MessageCircle size={16} />
            <span>{post.comment_count || 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )

  if (truncate) {
    return (
      <>
        <Link href={`/post/${post.id}`} className="block h-full">
          {Content}
        </Link>
        <ReportModal 
          postId={post.id} 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)} 
        />
      </>
    )
  }

  return (
    <>
      {Content}
      <ReportModal 
        postId={post.id} 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </>
  )
}
