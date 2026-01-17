import { supabase } from '@/lib/supabase'
import { mockPosts, mockComments } from '@/lib/mock-data'
import { Post, Comment } from '@/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically import client components
const Sidebar = dynamic(() => import('@/components/Sidebar'), { ssr: true })
const PostCard = dynamic(() => import('@/components/PostCard'), { ssr: true })
const CommentList = dynamic(() => import('@/components/CommentList'), { ssr: true })
const CommentForm = dynamic(() => import('@/components/CommentForm'), { ssr: true })

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params
  
  let post: Post | null = null
  let comments: Comment[] = []
  let isMock = false

  try {
    // Fetch post
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (postError) throw postError
    post = postData

    // Fetch comments
    if (postData) {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: false })
        
      if (commentsError) throw commentsError
      comments = commentsData
    }
  } catch (error) {
    console.error('Error fetching post details:', error)
    // Fallback to mock data
    const foundPost = mockPosts.find(p => p.id === id)
    if (foundPost) {
      post = foundPost
      comments = mockComments.filter(c => c.post_id === id)
      isMock = true
    }
  }

  if (!post) {
    return (
      <main className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
        <h1 className="text-2xl font-bold text-slate-900">未找到该吐槽</h1>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">
          返回首页
        </Link>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black uppercase">
          <ArrowLeft size={16} />
          <span>返回列表</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8 xl:col-span-9">
          {isMock && (
            <div className="mb-6 brutalist-card p-4 bg-yellow-300 text-black border-2 border-black">
              <p className="font-black uppercase text-lg mb-1">⚠️ 演示模式启动</p>
              <p className="font-mono font-bold">当前显示的是演示数据。</p>
            </div>
          )}
          
          <PostCard post={post} truncate={false} />

          <div className="mt-8 rounded-none bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            <h2 className="mb-6 text-2xl font-black text-black uppercase tracking-tight">
              评论 ({comments.length})
            </h2>
            
            <CommentForm postId={post.id} />
            <CommentList comments={comments} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24">
            <Sidebar currentCategory={post.category} />
          </div>
        </div>
      </div>
    </main>
  )
}
