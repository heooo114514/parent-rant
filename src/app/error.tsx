'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f0f0f0] p-4 font-mono">
      <div className="w-full max-w-md border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center border-2 border-black bg-red-600 text-white shadow-[4px_4px_0_0_black]">
            <AlertTriangle size={40} />
          </div>
        </div>
        
        <h2 className="mb-2 text-3xl font-black uppercase text-black">
          SYSTEM ERROR / 系统崩溃
        </h2>
        
        <div className="my-6 border-2 border-black bg-black p-4 text-left overflow-hidden">
          <p className="font-mono text-xs text-[var(--primary-color)] break-all">
            &gt; ERROR_CODE: {error.digest || 'UNKNOWN_FAILURE'}
          </p>
          <p className="mt-2 font-mono text-xs text-white break-all">
            &gt; MESSAGE: {error.message || 'Something went terribly wrong.'}
          </p>
        </div>

        <p className="mb-8 text-lg font-bold text-gray-600">
          别慌，可能是服务器被外星人劫持了，也可能是代码写太烂了。
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 border-2 border-black bg-[var(--primary-color)] px-6 py-3 font-black text-black transition-all hover:translate-y-1 hover:shadow-[4px_4px_0_0_black] hover:bg-white"
          >
            <RefreshCcw size={20} />
            重试 (RETRY)
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 border-2 border-black bg-white px-6 py-3 font-black text-black transition-all hover:translate-y-1 hover:shadow-[4px_4px_0_0_black] hover:bg-[var(--secondary-color)]"
          >
            <Home size={20} />
            回首页 (HOME)
          </Link>
        </div>
      </div>
    </div>
  )
}
