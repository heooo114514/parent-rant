'use client'

import Link from 'next/link'
import { MessageSquarePlus, LogIn, User, LogOut } from 'lucide-react'
import SearchInput from './SearchInput'
import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import AnnouncementBanner from './AnnouncementBanner'

export default function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsMenuOpen(false)
    router.refresh()
    toast.success('已退出登录')
  }

  return (
    <>
      <AnnouncementBanner />
      <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-white shadow-[0_4px_0_0_rgba(0,0,0,0.1)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-black text-black tracking-tighter hover:underline decoration-4 underline-offset-4 group">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#00ff00] text-black shadow-[2px_2px_0_0_black] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
            <MessageSquarePlus size={24} />
          </div>
          <span className="hidden sm:inline uppercase">吐了么</span>
        </Link>

        <div className="mx-4 flex-1 flex justify-center max-w-md">
          <Suspense>
            <SearchInput />
          </Suspense>
        </div>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/about" className="hidden text-sm font-bold text-black hover:bg-black hover:text-white px-2 py-1 transition-colors sm:block">
            关于我们
          </Link>
          <Link href="/contact" className="hidden text-sm font-bold text-black hover:bg-black hover:text-white px-2 py-1 transition-colors sm:block">
            联系我们
          </Link>
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white hover:bg-black hover:text-white transition-all focus:outline-none"
              >
                {user.user_metadata.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt={user.email || 'User'} 
                    className="h-full w-full object-cover border-2 border-transparent"
                  />
                ) : (
                  <User size={20} />
                )}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right border-2 border-black bg-white py-0 shadow-hard focus:outline-none">
                  <div className="px-4 py-3 border-b-2 border-black bg-yellow-300">
                    <p className="truncate text-xs font-bold text-black uppercase">USER: {user.email?.split('@')[0]}</p>
                  </div>
                  <Link 
                    href="/new" 
                    className="block px-4 py-2 text-sm font-bold text-black hover:bg-black hover:text-white border-b-2 border-black"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    我要吐槽
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block px-4 py-2 text-sm font-bold text-black hover:bg-black hover:text-white border-b-2 border-black"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    个人设置
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <LogOut size={14} />
                    溜了溜了
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/login" 
              className="brutalist-btn"
            >
              <LogIn size={16} className="mr-2" />
              <span className="hidden sm:inline">上号开喷</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
    </>
  )
}
