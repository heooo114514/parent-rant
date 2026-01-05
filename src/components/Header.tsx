'use client'

import Link from 'next/link'
import { MessageSquarePlus, LogIn, User, LogOut } from 'lucide-react'
import SearchInput from './SearchInput'
import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <MessageSquarePlus size={20} />
          </div>
          <span className="hidden sm:inline">ParentRant: 爸妈吐槽大会</span>
        </Link>

        <div className="mx-4 flex-1 flex justify-center max-w-md">
          <Suspense>
            <SearchInput />
          </Suspense>
        </div>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/about" className="hidden text-sm font-medium text-slate-600 hover:text-blue-600 sm:block">
            关于我们
          </Link>
          <Link href="/support" className="hidden text-sm font-medium text-slate-600 hover:text-blue-600 sm:block">
            投喂开发者
          </Link>
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white transition-all hover:bg-slate-200 focus:outline-none focus:ring-blue-500"
              >
                {user.user_metadata.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt={user.email || 'User'} 
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-slate-600" />
                )}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="truncate text-sm font-medium text-slate-900">{user.email}</p>
                  </div>
                  <Link 
                    href="/new" 
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    我要吐槽
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    个人设置
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
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
              className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">上号开喷</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
