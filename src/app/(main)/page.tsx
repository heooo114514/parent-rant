import PostList from '@/components/PostList'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { PenLine } from 'lucide-react'
import { Suspense } from 'react'
import PostSkeleton from '@/components/PostSkeleton'
import TiltButton from '@/components/TiltButton'

interface PageProps {
  searchParams: Promise<{ 
    category?: string 
    q?: string
    sort?: string
  }>
}

export default async function Home({ searchParams }: PageProps) {
  const { category, q, sort } = await searchParams

  return (
    <main className="container mx-auto px-4 py-8">
      {!q && (
        <div className="mb-10 flex flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            爸妈吐槽大会 & 学生反击基地
          </h1>
          <p className="max-w-xl text-lg text-slate-600">
            作业写不完？家长太唠叨？老师管太宽？
            <br />
            来这里发疯发癫，寻找你的吐槽搭子！
          </p>
          <div className="mt-4">
            <TiltButton>
              <Link 
                href="/new" 
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
              >
                <PenLine size={20} />
                <span>我要开喷</span>
              </Link>
            </TiltButton>
          </div>
        </div>
      )}

      {q && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            搜索结果: <span className="text-blue-600">{q}</span>
          </h2>
          <Link href="/" className="mt-2 inline-block text-sm text-slate-500 hover:text-blue-600">
            &larr; 返回全部
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main Content - Post List */}
        <div className="lg:col-span-8 xl:col-span-9">
          <Suspense fallback={
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          }>
            <PostList category={category} searchQuery={q} sort={sort} />
          </Suspense>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24">
            <Sidebar currentCategory={category} />
          </div>
        </div>
      </div>
    </main>
  )
}
