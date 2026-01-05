import { Coffee, ShieldCheck, HeartHandshake, Filter } from 'lucide-react'
import Link from 'next/link'
import { CATEGORY_LABELS } from '@/types'
import { cn } from '@/lib/utils'

interface SidebarProps {
  currentCategory?: string
}

export default function Sidebar({ currentCategory }: SidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Category Filter */}
      <div className="rounded-xl bg-white p-6 shadow-sm border-b-2 border-slate-100">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Filter className="text-blue-600" size={20} />
          <h2 className="font-bold text-slate-900">分类浏览</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link 
            href="/"
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition-colors",
              !currentCategory 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700"
            )}
          >
            全部
          </Link>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <Link
              key={value}
              href={`/?category=${value}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                currentCategory === value
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Rules Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="text-blue-600" size={20} />
          <h2 className="font-bold text-slate-900">吐槽守则 (保命用)</h2>
        </div>
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="flex gap-2">
            <span className="flex-none font-bold text-blue-500">1.</span>
            <span>别骂太难听，大家都是苦命人，留点口德。</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-none font-bold text-blue-500">2.</span>
            <span>保护隐私，别爆真实姓名，小心被爸妈发现混合双打。</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-none font-bold text-blue-500">3.</span>
            <span>发疯要适度，吐槽是为了更好地活着，不是为了气死自己。</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-none font-bold text-blue-500">4.</span>
            <span>相互理解，每位家长都不容易（虽然有时候真的很气人）。</span>
          </li>
        </ul>
      </div>

      {/* Sponsorship Card */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-amber-200 pb-3">
          <HeartHandshake className="text-amber-600" size={20} />
          <h2 className="font-bold text-amber-900">投喂开发者</h2>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-amber-800">
          ParentRant 是一个由爱心家长（也是受害者）用爱发电建立的。
        </p>
        <p className="mb-6 text-sm leading-relaxed text-amber-800">
          服务器要钱，咖啡要钱，被爸妈气得掉头发植发也要钱... 赏口饭吃吧！
        </p>
        
        <Link 
          href="/support"
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white transition-all hover:bg-amber-600 hover:shadow-md active:scale-95"
        >
          <Coffee size={18} className="transition-transform group-hover:-rotate-12" />
          <span>请喝冰美式消消火 ☕</span>
        </Link>
      </div>
    </div>
  )
}
