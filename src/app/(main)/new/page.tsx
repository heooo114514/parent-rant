import PostForm from '@/components/PostForm'
import { Sparkles, AlertCircle, Coffee, Smile } from 'lucide-react'

export default function NewPostPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 w-full">
      <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">发布新吐槽</h1>
          <p className="text-lg text-slate-600">说出你的心里话，让大家也乐呵乐呵（划掉）安慰安慰</p>
        </div>

        <PostForm />
      </div>
    </main>
  )
}
