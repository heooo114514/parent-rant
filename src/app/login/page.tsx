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
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="brutalist-card w-full max-w-md space-y-8 p-8 text-center bg-yellow-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-black bg-white">
            <Mail className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-3xl font-black uppercase text-black">去收邮件啊亲</h2>
          <p className="text-black font-mono font-bold">
            {isForgotPassword ? '重置密码链接' : '验证邮件'}已经发送到 <span className="bg-black text-white px-1">{email}</span>
            <br />
            别傻等着了，快去点邮件里的链接{isForgotPassword ? '重置密码' : '激活账号'}！
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                setCheckEmail(false)
                setIsForgotPassword(false)
              }}
              className="text-sm font-bold text-black hover:underline uppercase"
            >
              &larr; 返回登录
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="brutalist-card w-full max-w-md space-y-8 p-8 bg-white">
        <div className="text-center">
          <h2 className="text-4xl font-black tracking-tighter text-black uppercase">
            {isForgotPassword ? '重置密码' : (isSignUp ? '注册受害者账号' : '登录 吐了么')}
          </h2>
          <p className="mt-2 text-sm font-bold font-mono text-gray-500">
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
                <Mail className="h-5 w-5 text-black" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="brutalist-input block w-full pl-10 placeholder:text-gray-400 font-mono"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {!isForgotPassword && (
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="brutalist-input block w-full pl-10 placeholder:text-gray-400 font-mono"
                  placeholder="Password (min 6 chars)"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="brutalist-btn w-full justify-center bg-black text-white hover:bg-white hover:text-black uppercase tracking-wider text-lg py-3"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (
              isForgotPassword ? '发送重置链接' : (isSignUp ? '立即注册' : '立刻开喷')
            )}
            {!isLoading && (isForgotPassword ? <Send size={16} className="ml-2" /> : <ArrowRight size={16} className="ml-2" />)}
          </button>
        </form>

        <div className="mt-4 flex justify-between items-center text-sm font-bold">
          {!isForgotPassword ? (
            <>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-black hover:underline decoration-2 underline-offset-4"
              >
                {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
              </button>
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-gray-500 hover:text-black"
              >
                忘记密码？
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="text-black hover:underline decoration-2 underline-offset-4 mx-auto"
            >
              返回登录
            </button>
          )}
        </div>

        <div className="mt-6 text-center text-xs font-bold font-mono text-gray-400">
          <div className="mb-4">
             <Link href="/admin/login" className="text-gray-400 hover:text-black transition-colors uppercase">
               我是管理员(SSO登录)
             </Link>
          </div>
          {isSignUp ? '注册' : '登录'}即代表您同意我们的
          <a href="#" className="mx-1 text-black hover:underline decoration-2">
            服务条款
          </a>
          和
          <a href="#" className="mx-1 text-black hover:underline decoration-2">
            隐私政策
          </a>
          {config.site.icp && (
            <div className="mt-4 border-t-2 border-black pt-4">
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black">
                {config.site.icp}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
