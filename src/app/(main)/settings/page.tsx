'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { User, Camera, Loader2, Save, Mail } from 'lucide-react'
import Image from 'next/image'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }
        
        setUser(user)

        const { data, error, status } = await supabase
          .from('profiles')
          .select('nickname, bio, avatar_url')
          .eq('id', user.id)
          .single()

        if (error && status !== 406) {
          throw error
        }

        if (data) {
          setNickname(data.nickname || '')
          setBio(data.bio || '')
          setAvatarUrl(data.avatar_url)
        } else {
          // If no profile exists, maybe use metadata
          setNickname(user.user_metadata.full_name || user.email?.split('@')[0] || '')
          setAvatarUrl(user.user_metadata.avatar_url)
        }
      } catch (error) {
        console.error('Error loading user data!', error)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [router, supabase])

  const updateProfile = async () => {
    try {
      setUpdating(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      const updates = {
        id: user.id,
        nickname,
        bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) throw error
      
      // Also update auth metadata for faster access in other parts
      await supabase.auth.updateUser({
        data: { full_name: nickname, avatar_url: avatarUrl }
      })

      toast.success('个人资料已更新')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || '更新失败')
    } finally {
      setUpdating(false)
    }
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUpdating(true)
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('请选择图片')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      
      // Auto save after upload? Or just let user click save. 
      // Let's just update the state and let user save to commit changes.
      toast.success('头像上传成功，请点击保存以应用更改')

    } catch (error: any) {
      toast.error(error.message || '上传头像失败')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-none bg-white p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-8">
        <h1 className="text-3xl font-black text-black mb-8 uppercase tracking-tight">个人资料设置</h1>

        <div className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative group">
              <div className="h-24 w-24 overflow-hidden rounded-none border-2 border-black bg-slate-50">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <User size={40} className="text-black" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-[-10px] right-[-10px] flex h-8 w-8 items-center justify-center rounded-none border-2 border-black bg-[#00ff00] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={updating}
              />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-black text-lg">头像</h3>
              <p className="text-sm font-mono font-bold text-gray-500 mt-1">
                支持 JPG, GIF, PNG 格式。建议尺寸 200x200px。
              </p>
            </div>
          </div>

          <div className="border-t-2 border-black my-6"></div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-black mb-1 uppercase">
                邮箱账号
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-black" />
                </div>
                <input
                  type="text"
                  value={user?.email}
                  disabled
                  className="block w-full rounded-none border-2 border-black bg-gray-100 py-2.5 pl-10 text-gray-500 font-mono sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-bold text-black mb-1 uppercase">
                昵称
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="brutalist-input block w-full py-2.5 px-3 font-mono text-black placeholder:text-gray-400 sm:text-sm"
                placeholder="给自己起个响亮的名号"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-bold text-black mb-1 uppercase">
                个人简介
              </label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="brutalist-input block w-full py-2.5 px-3 font-mono text-black placeholder:text-gray-400 sm:text-sm"
                placeholder="介绍一下你自己..."
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={updateProfile}
              disabled={updating}
              className="brutalist-btn w-full sm:w-auto bg-[#00ff00] hover:bg-[#00cc00] text-lg px-8 py-3 uppercase tracking-wider"
            >
              {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="mr-2" />}
              保存修改
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
