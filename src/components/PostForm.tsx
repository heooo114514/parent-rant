'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Loader2, Image as ImageIcon, X, Smile, Save, Send } from 'lucide-react'
import dynamic from 'next/dynamic'
import { EmojiStyle } from 'emoji-picker-react'

const EmojiPicker = dynamic(
  () => import('emoji-picker-react').then((mod) => ({ default: mod.default })),
  { ssr: false, loading: () => <Loader2 className="animate-spin text-black" /> }
)

import { toast } from 'sonner'
import { CATEGORY_LABELS, Category } from '@/types'
import MarkdownEditor from './MarkdownEditor'
import { createPost } from '@/app/actions/post'

const colors = [
  { id: 'blue', class: 'bg-blue-100 border-blue-200', activeClass: 'bg-blue-200' },
  { id: 'green', class: 'bg-emerald-100 border-emerald-200', activeClass: 'bg-emerald-200' },
  { id: 'purple', class: 'bg-purple-100 border-purple-200', activeClass: 'bg-purple-200' },
  { id: 'orange', class: 'bg-orange-100 border-orange-200', activeClass: 'bg-orange-200' },
  { id: 'pink', class: 'bg-pink-100 border-pink-200', activeClass: 'bg-pink-200' },
  { id: 'gray', class: 'bg-slate-100 border-slate-200', activeClass: 'bg-slate-200' },
]

const AUTO_SAVE_KEY = 'parentrant_draft_v1'

export default function PostForm() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [nickname, setNickname] = useState('')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [category, setCategory] = useState<Category>('other')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Image states are not auto-saved for simplicity (files cannot be saved to localStorage easily)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load draft on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Try to get nickname from profile first
      const { data } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single()
      
      const profileNickname = data?.nickname || user.user_metadata.full_name
      
      if (profileNickname) {
        setNickname(prev => prev || profileNickname)
      }
    }

    // Load draft
    const saved = localStorage.getItem(AUTO_SAVE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.content) setContent(data.content)
        if (data.nickname) setNickname(data.nickname)
        if (data.category) setCategory(data.category)
        if (data.selectedColor) setSelectedColor(data.selectedColor)
        toast.info('已恢复上次未发布的草稿')
      } catch (e) {
        console.error('Failed to load draft', e)
      }
    }

    // Fetch profile if no nickname loaded from draft (or even if loaded, maybe we shouldn't overwrite? 
    // My previous logic `setNickname(prev => prev || profileNickname)` ensures we don't overwrite if draft set it.
    fetchProfile()
  }, [])

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content || nickname || category !== 'other') {
        const data = { content, nickname, category, selectedColor }
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data))
        setLastSaved(new Date())
      }
    }, 1000) // Debounce 1s

    return () => clearTimeout(timer)
  }, [content, nickname, category, selectedColor])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('图片太大了，请上传5MB以内的图片')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('图片太大了，请上传5MB以内的图片')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error('图片上传失败，请稍后重试')
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName)
      
    return publicUrl
  }

  const onEmojiClick = (emojiObject: any) => {
    setContent(prev => prev + emojiObject.emoji)
    setShowEmojiPicker(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !imageFile) {
      toast.error('好歹写点啥或者发张图吧？')
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrl = null

      if (imageFile) {
        imageUrl = await uploadImageToSupabase(imageFile)
      }

      const result = await createPost({
        content,
        nickname,
        category,
        color: selectedColor,
        imageUrl
      })

      if (!result.success) {
        toast.error(result.message)
        return
      }

      // Clear draft
      localStorage.removeItem(AUTO_SAVE_KEY)
      setContent('')
      setNickname('')
      setCategory('other')
      removeImage()
      router.push('/')
      router.refresh()
      toast.success(result.message)
    } catch (error: any) {
      console.error('Error creating post:', error)
      toast.error('发布失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 font-mono">
      {/* Top Bar with Auto-save indicator */}
      <div className="flex items-center justify-between text-sm text-black px-1 font-bold">
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="flex items-center gap-1.5 text-xs bg-white border-2 border-black px-2 py-1 shadow-[2px_2px_0_0_black]">
              <Save size={12} />
              草稿已保存于 {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-black hover:bg-[#ffc0cb] border-2 border-transparent hover:border-black transition-all flex items-center gap-1 text-sm font-black px-2 py-1"
          >
            <Smile size={18} />
            <span>插入表情</span>
          </button>
          {showEmojiPicker && (
            <div className="absolute right-0 top-8 z-50 shadow-[8px_8px_0_0_black] border-2 border-black bg-white">
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowEmojiPicker(false)}
              />
              <div className="relative z-50">
                <EmojiPicker 
                  onEmojiClick={onEmojiClick} 
                  width={320} 
                  height={400}
                  emojiStyle={EmojiStyle.NATIVE}
                  lazyLoadEmojis={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="relative group">
        <MarkdownEditor
          content={content}
          onChange={setContent}
          placeholder="请开始你的表演... (支持 Markdown 语法)"
          onImageUpload={uploadImageToSupabase}
          minHeight="min-h-[500px]"
          className="shadow-[8px_8px_0_0_black] hover:translate-y-1 hover:shadow-[4px_4px_0_0_black] transition-all duration-300"
        />
        
        {/* Featured Image Preview (if uploaded via button below) */}
        {imagePreview && (
          <div className="absolute bottom-4 right-4 z-10">
            <div className="relative inline-block group/image">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-24 w-24 border-2 border-black shadow-[4px_4px_0_0_black] object-cover bg-white"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center border-2 border-black bg-red-600 text-white shadow-[2px_2px_0_0_black] opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-red-700"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Settings Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-6 border-2 border-black shadow-[8px_8px_0_0_black]">
        {/* Settings Column */}
        <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-black text-black uppercase">
              江湖代号
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="比如：朝阳区吴彦祖"
              className="w-full border-2 border-black px-3 py-2 text-sm text-black focus:bg-[#00ff00] focus:outline-none placeholder:text-gray-500 font-bold transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-black text-black uppercase">
              吐槽分类
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full border-2 border-black px-3 py-2 text-sm text-black focus:bg-[#00ff00] focus:outline-none font-bold transition-colors appearance-none"
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase">
              卡片颜色
            </label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color.id)}
                  className={cn(
                    "h-8 w-8 border-2 border-black transition-all",
                    color.class,
                    selectedColor === color.id ? "ring-2 ring-black ring-offset-2 scale-110 shadow-[2px_2px_0_0_black]" : "hover:scale-105 hover:shadow-[2px_2px_0_0_black]"
                  )}
                  aria-label={`Select ${color.id} color`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="md:col-span-3 flex flex-col justify-end gap-3 border-t-2 md:border-t-0 md:border-l-2 border-black pt-4 md:pt-0 md:pl-6">
           <div className="flex items-center gap-2 mb-auto">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-black bg-white px-4 py-2 text-sm font-black text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_black] hover:shadow-none hover:translate-y-1"
              >
                <ImageIcon size={18} />
                <span>添加封面</span>
              </button>
           </div>
           
           <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 border-2 border-black bg-[#00ff00] px-4 py-3 text-sm font-black text-black shadow-[4px_4px_0_0_black] hover:bg-white hover:shadow-none hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>发送中...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>立即发布</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
