import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f0f0f0] p-4 font-mono">
      <div className="border-2 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-9xl font-black text-black">404</h1>
        <div className="my-8 h-2 w-full bg-black"></div>
        <h2 className="mb-4 text-3xl font-black uppercase text-black">Page Not Found</h2>
        <p className="mb-8 text-xl font-bold text-gray-600">
          你要找的页面不存在，或者被外星人抓走了。
        </p>
        <Link 
          href="/"
          className="inline-block border-2 border-black bg-[var(--primary-color)] px-8 py-4 text-xl font-black text-black transition-all hover:translate-y-1 hover:shadow-[4px_4px_0_0_black] hover:bg-white"
        >
          GO BACK HOME
        </Link>
      </div>
    </div>
  )
}
