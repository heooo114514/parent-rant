'use client'

import { createClient } from '@/utils/supabase/client'
import { Mail, Loader2, ArrowRight, Lock, User, RefreshCw, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import config from '../../../parent-rant.config.json'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isForgotPassword) {
      if (!email.trim()) {
        toast.error('请输入邮箱地址')
        return
      }
      setIsLoading(true)
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/update-password`,
      })
      setIsLoading(false)
      
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('重置密码邮件已发送，请检查收件箱')
        setCheckEmail(true)
      }
      return
    }

    if (!email.trim() || !password.trim()) {
      toast.error('请填写所有字段')
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
            data: {
              full_name: email.split('@')[0], // Optional: set a default metadata
            }
          },
        })
        if (error) throw error

        // Check if session is established (Auto-confirm enabled or verification disabled)
        if (data.session) {
          toast.success('注册成功！已自动登录')
          router.push('/')
          router.refresh()
        } else {
          // Verification required
          setCheckEmail(true)
          toast.success('注册成功！快去收邮件吧')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success('登录成功')
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    } finally {
      setIsLoading(false)
    }
  }

  if (checkEmail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">去收邮件啊亲</h2>
          <p className="text-slate-600">
            {isForgotPassword ? '重置密码链接' : '验证邮件'}已经发送到 <span className="font-medium text-slate-900">{email}</span>
            <br />
            别傻等着了，快去点邮件里的链接{isForgotPassword ? '重置密码' : '激活账号'}！
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                setCheckEmail(false)
                setIsForgotPassword(false)
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              &larr; 返回登录
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {isForgotPassword ? '重置密码' : (isSignUp ? '注册受害者账号' : '登录 ParentRant')}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isForgotPassword 
              ? '别急，我们会发邮件帮你找回密码' 
              : (isSignUp ? '加入我们要吐槽的大家庭，一起抱团取暖' : '欢迎回来，今天又被爸妈整破防了吗？')}
          </p>
        </div>

        <form onSubmit={handleAuth} className="mt-8 space-y-4">
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
                placeholder="your@email.com"
              />
            </div>
          </div>

          {!isForgotPassword && (
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 py-3 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  placeholder="Password (min 6 chars)"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (
              isForgotPassword ? '发送重置链接' : (isSignUp ? '注册' : '登录')
            )}
            {!isLoading && (isForgotPassword ? <Send size={16} /> : <ArrowRight size={16} />)}
          </button>
        </form>

        <div className="mt-4 flex justify-between items-center text-sm">
          {!isForgotPassword ? (
            <>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
              </button>
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-slate-500 hover:text-slate-700"
              >
                忘记密码？
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="font-medium text-blue-600 hover:text-blue-500 mx-auto"
            >
              返回登录
            </button>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          <div className="mb-4">
             <Link href="/admin/login" className="text-slate-400 hover:text-blue-600 transition-colors">
               我是管理员(SSO登录)
             </Link>
          </div>
          {isSignUp ? '注册' : '登录'}即代表您同意我们的
          <a href="#" className="mx-1 text-blue-600 hover:underline">
            服务条款
          </a>
          和
          <a href="#" className="mx-1 text-blue-600 hover:underline">
            隐私政策
          </a>
          {config.site.icp && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-slate-500">
                {config.site.icp}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
