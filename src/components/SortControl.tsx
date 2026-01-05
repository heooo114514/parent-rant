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
    <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="text-sm font-medium text-slate-500">排序方式</span>
      <div className="flex gap-2">
        <button
          onClick={() => handleSort('latest')}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            currentSort === 'latest' 
              ? "bg-blue-50 text-blue-600" 
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <Clock size={16} />
          最新
        </button>
        <button
          onClick={() => handleSort('hottest')}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            currentSort === 'hottest' 
              ? "bg-orange-50 text-orange-600" 
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <Flame size={16} />
          最热
        </button>
      </div>
    </div>
  )
}
