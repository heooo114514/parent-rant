'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ArrowUpDown, Flame, Clock } from 'lucide-react'

export default function SortControl() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'latest'

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="mb-6 flex items-center justify-between rounded-none border-2 border-black bg-white px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <span className="text-sm font-bold text-black uppercase tracking-wider">排序方式</span>
      <div className="flex gap-2">
        <button
          onClick={() => handleSort('latest')}
          className={cn(
            "flex items-center gap-1.5 rounded-none px-3 py-1.5 text-sm font-bold transition-all border-2",
            currentSort === 'latest' 
              ? "bg-[var(--primary-color)] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
              : "text-gray-500 border-transparent hover:bg-[var(--secondary-color)] hover:text-black hover:border-black"
          )}
        >
          <Clock size={16} />
          最新
        </button>
        <button
          onClick={() => handleSort('hottest')}
          className={cn(
            "flex items-center gap-1.5 rounded-none px-3 py-1.5 text-sm font-bold transition-all border-2",
            currentSort === 'hottest' 
              ? "bg-[var(--secondary-color)] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
              : "text-gray-500 border-transparent hover:bg-[var(--secondary-color)] hover:text-black hover:border-black"
          )}
        >
          <Flame size={16} />
          最热
        </button>
      </div>
    </div>
  )
}
