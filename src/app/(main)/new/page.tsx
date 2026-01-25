import PostForm from '@/components/PostForm'
import { Sparkles, AlertCircle, Coffee, Smile } from 'lucide-react'

export default function NewPostPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 w-full">
      <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl md:text-6xl font-black text-black tracking-tighter uppercase">发布新吐槽</h1>
          <p className="text-xl font-mono font-bold text-black bg-[#ffc0cb] inline-block px-4 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            说出你的心里话，让大家也乐呵乐呵
          </p>
        </div>

        <PostForm />
      </div>
    </div>
  )
}
