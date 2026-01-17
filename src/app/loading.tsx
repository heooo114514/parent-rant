export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f0f0]">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 animate-spin border-4 border-black border-t-[#00ff00]"></div>
        <p className="mt-4 font-mono text-xl font-black text-black uppercase tracking-widest">Loading...</p>
      </div>
    </div>
  )
}
