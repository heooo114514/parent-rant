import { cn } from "@/lib/utils"

export default function PostSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" />
      </div>
      
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
      </div>
      
      <div className="mt-8 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-14 animate-pulse rounded-full bg-slate-200" />
          <div className="h-8 w-14 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  )
}
