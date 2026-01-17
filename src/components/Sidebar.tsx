import { Coffee, ShieldCheck, HeartHandshake, Filter } from 'lucide-react'
import Link from 'next/link'
import { CATEGORY_LABELS } from '@/types'
import { cn } from '@/lib/utils'

interface SidebarProps {
  currentCategory?: string
}

export default function Sidebar({ currentCategory }: SidebarProps) {
  const CATEGORY_COLORS: Record<string, string> = {
    'school': 'bg-[#00ff00]', // Green
    'life': 'bg-yellow-300',   // Yellow
    'money': 'bg-pink-300',   // Pink
    'social': 'bg-cyan-300',  // Cyan
    'other': 'bg-orange-300'  // Orange
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Category Filter */}
      <div className="brutalist-card p-6 bg-[#f0f0f0]">
        <div className="mb-4 flex items-center gap-2 border-b-2 border-black pb-3">
          <Filter className="text-black" size={24} />
          <h2 className="text-xl font-black uppercase tracking-tight">分类浏览</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link 
            href="/"
            className={cn(
              "border-2 border-black px-3 py-1.5 text-sm font-bold transition-all hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
              !currentCategory 
                ? "bg-black text-white" 
                : "bg-white text-black hover:bg-black hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
            )}
          >
            全部
          </Link>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <Link
              key={value}
              href={`/?category=${value}`}
              className={cn(
                "border-2 border-black px-3 py-1.5 text-sm font-bold transition-all hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                currentCategory === value
                  ? `${CATEGORY_COLORS[value] || 'bg-black'} text-black shadow-none translate-y-[2px] translate-x-[2px]`
                  : `bg-white text-black hover:${CATEGORY_COLORS[value] || 'bg-black'} hover:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]`
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Rules Card */}
      <div className="brutalist-card p-6 bg-yellow-300">
        <div className="mb-4 flex items-center gap-2 border-b-2 border-black pb-3">
          <ShieldCheck className="text-black" size={24} />
          <h2 className="text-xl font-black uppercase tracking-tight">吐槽守则</h2>
        </div>
        <ul className="space-y-3 text-sm font-bold text-black font-mono">
          <li className="flex gap-2">
            <span className="flex-none bg-black text-white w-6 h-6 flex items-center justify-center border-2 border-black">1</span>
            <span>别骂太难听，大家都是苦命人，留点口德。</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-none bg-black text-white w-6 h-6 flex items-center justify-center border-2 border-black">2</span>
            <span>保护隐私，别爆真实姓名，小心被爸妈发现混合双打。</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-none bg-black text-white w-6 h-6 flex items-center justify-center border-2 border-black">3</span>
            <span>发疯要适度，吐槽是为了更好地活着。</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-none bg-black text-white w-6 h-6 flex items-center justify-center border-2 border-black">4</span>
            <span>相互理解，每位家长都不容易（虽然有时候真的很气人）。</span>
          </li>
        </ul>
      </div>

      {/* Sponsorship Card */}
      <div className="brutalist-card p-6 bg-white">
        <div className="mb-4 flex items-center gap-2 border-b-2 border-black pb-3">
          <HeartHandshake className="text-black" size={24} />
          <h2 className="text-xl font-black uppercase tracking-tight">投喂开发者</h2>
        </div>
        <p className="mb-4 text-sm font-bold leading-relaxed border-l-4 border-black pl-4">
          吐了么 是一个由爱心家长（也是受害者）用爱发电建立的。
        </p>
        <p className="mb-6 text-sm font-bold leading-relaxed">
          服务器要钱，咖啡要钱，被爸妈气得掉头发植发也要钱... 赏口饭吃吧！
        </p>
        
        <Link 
          href="/support"
          className="brutalist-btn w-full justify-center text-base uppercase tracking-wider bg-pink-400 hover:bg-black hover:text-pink-400 shadow-[4px_4px_0px_0px_black] hover:shadow-none transition-all"
        >
          <Coffee size={20} className="mr-2" />
          <span>请喝冰美式消消火 ☕</span>
        </Link>
      </div>
    </div>
  )
}
