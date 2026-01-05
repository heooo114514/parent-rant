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
      toast.error('该邮箱没有管理员权限')
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
        toast.success('登录成功')
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
        toast.success('登录成功 (Config Mode)')
        router.push('/admin')
        router.refresh()
      } else {
        // Show the Supabase error if config fallback also failed
        toast.error('登录失败: ' + error.message)
      }
    } catch (error: any) {
      toast.error('发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">管理后台登录</h2>
          <p className="mt-2 text-sm text-slate-600">请输入管理员账号密码</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">邮箱地址</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 py-3 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="sr-only">密码</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 py-3 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                placeholder="密码"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : '登录'}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  )
}

