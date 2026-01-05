import { supabase } from '@/lib/supabase'
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
        <div className="mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 border border-amber-200">
          <p className="font-semibold">⚠️ 演示模式</p>
          <p>由于未配置有效的数据库连接，当前显示的是演示数据。请参考 README 配置 Supabase 以启用完整功能。</p>
        </div>
      )}

      {(!posts || posts.length === 0) ? (
        <div className="flex h-60 w-full flex-col items-center justify-center gap-4 rounded-xl bg-slate-50 text-slate-500">
          <p className="text-lg">
            {searchQuery ? `没有找到包含 "${searchQuery}" 的吐槽` : '还没有人吐槽呢'}
          </p>
          <p className="text-sm">
            {searchQuery ? '换个关键词试试？' : '快来当第一个吐槽的家长吧！'}
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
