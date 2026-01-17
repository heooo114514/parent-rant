import { createClient } from '@/utils/supabase/server'
import PostCard from './PostCard'
import { Post } from '@/types'
import { mockPosts } from '@/lib/mock-data'

export const revalidate = 0 // Disable cache for realtime feel

import SortControl from './SortControl'

interface PostListProps {
  category?: string
  searchQuery?: string
  sort?: string
}

export default async function PostList({ category, searchQuery, sort = 'latest' }: PostListProps) {
  let posts: Post[] | null = null
  let error = null
  let isMock = false

  try {
    const supabase = await createClient()
    let query = supabase
      .from('posts')
      .select('*')
    
    // Apply sorting
    if (sort === 'hottest') {
      query = query.order('likes', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }
    
    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (searchQuery) {
      query = query.ilike('content', `%${searchQuery}%`)
    }

    const result = await query
    
    posts = result.data as Post[]
    error = result.error
  } catch (e) {
    console.error('Supabase connection error:', e)
    error = e as any
  }

  // Fallback to mock data if connection fails or error occurs
  if (error) {
    console.warn('Using mock data due to error:', error)
    posts = mockPosts
    
    if (category) {
      posts = posts.filter(p => p.category === category)
    }
    
    if (searchQuery) {
      posts = posts.filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    
    if (sort === 'hottest') {
      posts.sort((a, b) => b.likes - a.likes)
    } else {
      posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    isMock = true
  }

  return (
    <>
      <SortControl />
      
      {isMock && (
        <div className="mb-6 brutalist-card p-4 bg-yellow-300 text-black border-2 border-black">
          <p className="font-black uppercase text-lg mb-1">⚠️ 演示模式启动</p>
          <p className="font-mono font-bold">由于未配置有效的数据库连接，当前显示的是演示数据。请配置 Supabase 以启用完整火力。</p>
        </div>
      )}

      {(!posts || posts.length === 0) ? (
        <div className="flex h-60 w-full flex-col items-center justify-center gap-4 border-2 border-black border-dashed bg-slate-100 text-black p-8 text-center">
          <p className="text-2xl font-black uppercase">
            {searchQuery ? `没找到 "${searchQuery}"` : '一片荒芜'}
          </p>
          <p className="text-base font-bold font-mono">
            {searchQuery ? '换个词喷喷看？' : '快来当第一个开喷的勇士！'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  )
}
