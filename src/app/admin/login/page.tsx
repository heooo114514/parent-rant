'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Mail, ArrowRight, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import config from '../../../../parent-rant.config.json'
import { loginWithConfig } from '@/app/actions/auth'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return

    // Check if email is in the admin whitelist
    const ADMIN_WHITELIST = config.security.adminEmails
    
    if (!ADMIN_WHITELIST.includes(email)) {
      toast.error('你哪位啊？这儿没你地儿')
      return
    }
    
    setIsLoading(true)
    
    try {
      // First try to login with Supabase (if email system worked, this would be enough)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error) {
        toast.success('嘿，溜进来了')
        router.push('/admin')
        router.refresh()
        return
      }

      // If Supabase login fails (e.g. user not confirmed or doesn't exist yet),
      // try the "config password" fallback
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      
      const result = await loginWithConfig(formData)
      
      if (result.success) {
        toast.success('老板好，密码对上了')
        router.push('/admin')
        router.refresh()
      } else {
        // Show the Supabase error if config fallback also failed
        toast.error('没对上，再想想？')
      }
    } catch (error: any) {
      toast.error('出岔子了，歇会儿再试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f0f0f0] px-4 font-mono">
      <div className="w-full max-w-md space-y-8 border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center">
          <h2 className="text-3xl font-black text-black uppercase tracking-tighter">老板查岗</h2>
          <p className="mt-2 text-sm font-bold text-gray-600">暗号报上来，没对上别想进</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">邮箱地址</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-black" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full border-2 border-black py-3 pl-10 text-black placeholder:text-gray-500 focus:bg-[#00ff00] focus:outline-none focus:ring-0 sm:text-sm font-bold transition-colors"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="sr-only">密码</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-black" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full border-2 border-black py-3 pl-10 text-black placeholder:text-gray-500 focus:bg-[#00ff00] focus:outline-none focus:ring-0 sm:text-sm font-bold transition-colors"
                placeholder="密码"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 border-2 border-black bg-black px-4 py-3 text-sm font-black text-white transition-all hover:bg-white hover:text-black hover:shadow-[4px_4px_0_0_black] hover:-translate-y-1 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : '登录'}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  )
}
