'use client'

import { useState } from 'react'
import { Post } from '@/types'
import PostCard from './PostCard'
import ReportModal from './ReportModal'
import SortControl from './SortControl'
import config from '../../parent-rant.config.json'

interface PostListContentProps {
  posts: Post[] | null
  isMock: boolean
  searchQuery?: string
}

export default function PostListContent({ posts, isMock, searchQuery }: PostListContentProps) {
  const [reportingPostId, setReportingPostId] = useState<string | null>(null)

  return (
    <div className="pb-12">
      <SortControl />
      
      {isMock && (
        <div className="mb-6 brutalist-card p-4 bg-yellow-300 text-black border-2 border-black">
          <p className="font-black uppercase text-lg mb-1">{config.site.demoModeTitle}</p>
          <p className="font-mono font-bold">{config.site.demoModeMessage}</p>
        </div>
      )}

      {(!posts || posts.length === 0) ? (
        <div className="flex h-60 w-full flex-col items-center justify-center gap-4 border-2 border-black border-dashed bg-slate-100 text-black p-8 text-center">
          <p className="text-2xl font-black uppercase">
            {searchQuery ? `${config.site.notFoundTitle} "${searchQuery}"` : config.site.emptyTitle}
          </p>
          <p className="text-base font-bold font-mono">
            {searchQuery ? config.site.notFoundMessage : config.site.emptyMessage}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onReport={() => setReportingPostId(post.id)} />
          ))}
        </div>
      )}

      <ReportModal 
        postId={reportingPostId || ''} 
        isOpen={!!reportingPostId} 
        onClose={() => setReportingPostId(null)} 
      />
    </div>
  )
}
