import { createClient } from '@/utils/supabase/server'
import { Post } from '@/types'
import { mockPosts } from '@/lib/mock-data'
import PostListContent from './PostListContent'

export const revalidate = 0 // Disable cache for realtime feel

interface PostListProps {
  category?: string
  searchQuery?: string
  sort?: string
}

export default async function PostList({ category, searchQuery, sort = 'latest' }: PostListProps) {
  return <PostListClient category={category} searchQuery={searchQuery} sort={sort} />
}

async function PostListClient({ category, searchQuery, sort = 'latest' }: PostListProps) {
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

  return <PostListContent posts={posts} isMock={isMock} searchQuery={searchQuery} />
}
