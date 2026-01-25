import { Coffee, ShieldCheck, HeartHandshake, Filter } from 'lucide-react'
import Link from 'next/link'
import { CATEGORY_LABELS } from '@/types'
import { cn } from '@/lib/utils'
import config from '../../parent-rant.config.json'

interface SidebarProps {
  currentCategory?: string
}

export default function Sidebar({ currentCategory }: SidebarProps) {
  const CATEGORY_COLORS: Record<string, string> = {
    'school': 'bg-[var(--primary-color)]', // Green
    'life': 'bg-[var(--secondary-color)]',   // Yellow
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
      <div className="brutalist-card p-6 bg-[var(--secondary-color)]">
        <div className="mb-4 flex items-center gap-2 border-b-2 border-black pb-3">
          <ShieldCheck className="text-black" size={24} />
          <h2 className="text-xl font-black uppercase tracking-tight">吐槽守则</h2>
        </div>
        <ul className="space-y-3 text-sm font-bold text-black font-mono">
          {config.content.rules.map((rule, index) => (
            <li key={index} className="flex gap-2">
              <span className="flex-none bg-black text-white w-6 h-6 flex items-center justify-center border-2 border-black">{index + 1}</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sponsorship Card */}
      <div className="brutalist-card p-6 bg-white">
        <div className="mb-4 flex items-center gap-2 border-b-2 border-black pb-3">
          <HeartHandshake className="text-black" size={24} />
          <h2 className="text-xl font-black uppercase tracking-tight">{config.content.sponsorship.title}</h2>
        </div>
        <p className="mb-4 text-sm font-bold leading-relaxed border-l-4 border-black pl-4">
          {config.content.sponsorship.p1}
        </p>
        <p className="mb-6 text-sm font-bold leading-relaxed">
          {config.content.sponsorship.p2}
        </p>
        
        <Link 
          href="/support"
          className="brutalist-btn w-full justify-center text-base uppercase tracking-wider bg-pink-400 hover:bg-black hover:text-pink-400 shadow-[4px_4px_0px_0px_black] hover:shadow-none transition-all"
        >
          <Coffee size={20} className="mr-2" />
          <span>{config.content.sponsorship.button}</span>
        </Link>
      </div>
    </div>
  )
}
