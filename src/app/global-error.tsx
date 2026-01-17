'use client'
 
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col items-center justify-center bg-red-600 p-4 font-mono">
        <div className="w-full max-w-lg border-4 border-black bg-white p-12 shadow-[12px_12px_0px_0px_black] text-center">
           <div className="mb-6 flex justify-center">
            <div className="p-4 border-4 border-black bg-black text-white">
                <AlertTriangle size={64} />
            </div>
          </div>
          <h2 className="text-4xl font-black uppercase text-black mb-4 tracking-tighter">CRITICAL FAILURE</h2>
          <div className="bg-black text-[#00ff00] p-4 font-mono text-sm mb-8 text-left border-2 border-black overflow-auto max-h-40">
            &gt; SYSTEM_HALTED<br/>
            &gt; CAUSE: {error.message}<br/>
            &gt; DIGEST: {error.digest}
          </div>
          <button
            onClick={() => reset()}
            className="w-full border-4 border-black bg-[#00ff00] px-8 py-4 text-2xl font-black text-black hover:bg-white hover:translate-y-2 hover:shadow-none shadow-[8px_8px_0_0_black] transition-all"
          >
            REBOOT SYSTEM
          </button>
        </div>
      </body>
    </html>
  )
}
