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
        <div className="mb-12 flex flex-col items-center justify-center gap-6 text-center relative py-10">
          {/* Decorative shapes for "tone" */}
          <div className="absolute top-0 left-1/4 w-12 h-12 bg-yellow-400 border-2 border-black -rotate-12 -z-10 hidden sm:block"></div>
          <div className="absolute bottom-0 right-1/4 w-16 h-16 bg-[#00ff00] border-2 border-black rotate-12 -z-10 hidden sm:block"></div>
          <div className="absolute top-1/2 -left-4 w-10 h-10 bg-pink-400 border-2 border-black rotate-45 -z-10 hidden lg:block"></div>

          <h1 className="text-6xl font-black tracking-tighter text-black sm:text-8xl uppercase drop-shadow-[4px_4px_0px_#00ff00]">
            爸妈吐槽大会
          </h1>
          <div className="relative group">
            <div className="absolute -inset-2 bg-black -rotate-1 group-hover:rotate-1 transition-transform"></div>
            <p className="relative max-w-xl text-xl font-mono font-bold text-black border-2 border-black p-6 bg-white shadow-[8px_8px_0px_0px_#ffc0cb]">
              作业写不完？家长太唠叨？老师管太宽？
              <br />
              <span className="text-pink-600">来这里发疯发癫，寻找你的吐槽搭子！</span>
            </p>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <TiltButton>
              <Link 
                href="/new" 
                className="brutalist-btn text-xl px-10 py-5 bg-[#00ff00] text-black hover:bg-black hover:text-[#00ff00] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
              >
                <PenLine size={28} className="mr-2" />
                <span className="uppercase tracking-widest">我要开喷</span>
              </Link>
            </TiltButton>
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-yellow-300 font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-3">
              🔥 正在热喷中
            </div>
          </div>
        </div>
      )}

      {q && (
        <div className="mb-8">
          <h2 className="text-3xl font-black uppercase text-black">
            搜索结果: <span className="bg-black text-white px-2">{q}</span>
          </h2>
          <Link href="/" className="mt-2 inline-block text-sm font-bold text-gray-500 hover:text-black uppercase">
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
