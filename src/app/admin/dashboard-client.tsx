'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { Post, CATEGORY_LABELS } from '@/types'
import { formatDistanceToNow, format, subDays, startOfDay, isSameDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Loader2, Trash2, LogOut, LayoutDashboard, Mail, Send, Settings, User, BarChart as BarChartIcon, Search, Filter, AlertTriangle, Terminal, Code, Image as ImageIcon, Flag, Megaphone, CheckCircle, XCircle, Shield, Ban } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Legend } from 'recharts'
import { sendTestEmail } from '@/app/actions/email'
import { 
  getServerInfo, 
  getStorageFiles, 
  deleteStorageFile, 
  getReports, 
  updateReportStatus, 
  getAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement,
  getBannedIps,
  banIp,
  unbanIp
} from '@/app/actions/admin'
import config from '../../../parent-rant.config.json'

export default function AdminDashboardClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [mediaFiles, setMediaFiles] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [bannedIps, setBannedIps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'reports' | 'announcements' | 'security' | 'email' | 'settings' | 'developer'>('posts')
  const [testEmail, setTestEmail] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [serverInfo, setServerInfo] = useState<any>(null)
  
  // Announcement form state
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false)
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      // Load posts first as it's most important
      await fetchPosts()
      
      if (isMounted) {
        // Load secondary data
        fetchServerInfo()
        fetchMediaFiles()
        fetchReports()
        fetchAnnouncements()
        fetchBannedIps()
      }
    }

    loadData()
    
    return () => {
      isMounted = false
    }
  }, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error('获取列表失败')
    } else {
      setPosts(data as Post[])
    }
    setIsLoading(false)
  }

  const fetchMediaFiles = async () => {
    try {
      const result = await getStorageFiles()
      if (result.success) {
        setMediaFiles(result.data)
      } else {
        toast.error(result.message || '获取媒体文件失败')
      }
    } catch (error) {
      console.error('Failed to fetch media files:', error)
      toast.error('获取媒体文件失败')
    }
  }

  const fetchServerInfo = async () => {
    try {
      const info = await getServerInfo()
      setServerInfo(info)
    } catch (error) {
      console.error('Failed to fetch server info:', error)
    }
  }

  const fetchReports = async () => {
    try {
      const result = await getReports()
      if (result.success) {
        setReports(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const result = await getAnnouncements()
      if (result.success) {
        setAnnouncements(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    }
  }

  const fetchBannedIps = async () => {
    try {
      const result = await getBannedIps()
      if (result.success) {
        setBannedIps(result.data)
      }
    } catch (error) {
      // console.error('Failed to fetch banned ips:', error)
    }
  }

  const handleBanIp = async (ip: string, reason: string = '违反社区规定') => {
    if (!ip) {
      toast.error('无效的 IP 地址')
      return
    }
    if (!confirm(`确定要封禁 IP: ${ip} 吗？`)) return

    try {
      const result = await banIp(ip, reason)
      if (result.success) {
        toast.success('IP 已封禁')
        fetchBannedIps()
      } else {
        toast.error('操作失败: ' + result.message)
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  const handleUnbanIp = async (ip: string) => {
    if (!confirm(`确定要解封 IP: ${ip} 吗？`)) return

    try {
      const result = await unbanIp(ip)
      if (result.success) {
        toast.success('IP 已解封')
        fetchBannedIps()
      } else {
        toast.error('操作失败: ' + result.message)
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  const handleUpdateReportStatus = async (id: string, status: 'resolved' | 'dismissed') => {
    try {
      const result = await updateReportStatus(id, status)
      if (result.success) {
        toast.success('状态已更新')
        fetchReports()
      } else {
        toast.error('更新失败')
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnnouncement.trim()) return

    setIsSubmittingAnnouncement(true)
    try {
      const result = await createAnnouncement(newAnnouncement, true)
      if (result.success) {
        toast.success('公告已发布')
        setNewAnnouncement('')
        fetchAnnouncements()
      } else {
        toast.error('发布失败')
      }
    } catch (error) {
      toast.error('发布失败')
    } finally {
      setIsSubmittingAnnouncement(false)
    }
  }

  const handleToggleAnnouncement = async (id: string, currentStatus: boolean, content: string) => {
    try {
      const result = await updateAnnouncement(id, content, !currentStatus)
      if (result.success) {
        toast.success('状态已更新')
        fetchAnnouncements()
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('确定删除此公告？')) return
    try {
      const result = await deleteAnnouncement(id)
      if (result.success) {
        toast.success('已删除')
        fetchAnnouncements()
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条吐槽吗？此操作不可恢复')) return

    setIsDeleting(id)
    
    // Check if post has an image and delete it
    const post = posts.find(p => p.id === id)
    if (post && post.image_url) {
      const fileName = post.image_url.split('/').pop()
      if (fileName) {
        await deleteStorageFile(fileName)
      }
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('删除失败: ' + error.message)
    } else {
      toast.success('删除成功')
      setPosts(posts.filter(p => p.id !== id))
      // Refresh media files
      fetchMediaFiles()
    }
    setIsDeleting(null)
  }

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm('确定要删除这张图片吗？')) return
    
    const result = await deleteStorageFile(fileName)
    if (result.success) {
      toast.success('图片删除成功')
      setMediaFiles(mediaFiles.filter(f => f.name !== fileName))
    } else {
      toast.error('删除失败: ' + result.message)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }
  
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testEmail.trim()) {
      toast.error('请输入测试邮箱地址')
      return
    }

    setIsSendingEmail(true)
    try {
      const result = await sendTestEmail(testEmail)
      if (result.success) {
        toast.success(result.message)
        setTestEmail('')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('发送失败')
    } finally {
      setIsSendingEmail(false)
    }
  }

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = (post.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (post.nickname || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'all' || post.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [posts, searchQuery, filterCategory])

  // Calculate stats for BarChart
  const stats = useMemo(() => {
    return Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
      name: label,
      count: posts.filter(p => p.category === key).length
    }))
  }, [posts])

  // Calculate stats for Trend LineChart (Last 7 days)
  const trendStats = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i)
      return {
        date: d,
        dateStr: format(d, 'MM-dd'),
        count: 0
      }
    })

    posts.forEach(post => {
      const postDate = new Date(post.created_at)
      const dayStat = last7Days.find(d => isSameDay(d.date, postDate))
      if (dayStat) {
        dayStat.count++
      }
    })

    return last7Days
  }, [posts])

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0 hidden md:flex flex-col">
        <div className="flex h-16 items-center gap-2 px-6 font-bold text-xl border-b border-slate-800">
          <LayoutDashboard className="text-blue-500" />
          <span>ParentRant</span>
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'posts' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChartIcon size={20} />
            吐槽管理
          </button>
          
          <button
            onClick={() => setActiveTab('media')}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'media' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ImageIcon size={20} />
            媒体库
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'reports' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Flag size={20} />
            举报处理
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'announcements' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Megaphone size={20} />
            公告管理
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'security' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Shield size={20} />
            安全中心
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'email' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Mail size={20} />
            邮件系统
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'settings' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings size={20} />
            系统设置
          </button>

          <button
            onClick={() => setActiveTab('developer')}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'developer' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Code size={20} />
            开发者选项
          </button>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
              <User size={16} className="text-slate-300" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">管理员</p>
              <p className="truncate text-xs text-slate-500">admin</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-600/20 transition-colors"
          >
            <LogOut size={16} />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-slate-900">
              {activeTab === 'posts' && '仪表盘'}
              {activeTab === 'media' && '媒体资源库'}
              {activeTab === 'reports' && '举报处理'}
              {activeTab === 'announcements' && '公告管理'}
              {activeTab === 'security' && '安全中心'}
              {activeTab === 'email' && '邮件服务'}
              {activeTab === 'settings' && '系统设置'}
              {activeTab === 'developer' && '开发者选项'}
            </h2>
            <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
              查看前台 &rarr;
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {/* Stats Charts Row 1 */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {/* Quick Stats */}
                 <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                   <h3 className="mb-4 font-bold text-slate-700">数据概览</h3>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="rounded-lg bg-blue-50 p-4 text-center">
                       <div className="text-3xl font-bold text-blue-600">{posts.length}</div>
                       <div className="text-sm text-blue-600/80">总吐槽数</div>
                     </div>
                     <div className="rounded-lg bg-pink-50 p-4 text-center">
                       <div className="text-3xl font-bold text-pink-600">
                         {posts.reduce((acc, curr) => acc + (curr.likes || 0), 0)}
                       </div>
                       <div className="text-sm text-pink-600/80">总点赞数</div>
                     </div>
                   </div>
                 </div>

                 {/* Trend Chart */}
                 <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                   <h3 className="mb-4 font-bold text-slate-700">近7天吐槽趋势</h3>
                   <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={trendStats}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                         <XAxis dataKey="dateStr" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
                         <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} tick={{fill: '#64748b'}} />
                         <Tooltip 
                           contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                         />
                         <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 6}} />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
              </div>

              {/* Stats Charts Row 2 */}
              <div className="grid gap-6 md:grid-cols-2">
                 <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                   <h3 className="mb-4 font-bold text-slate-700">吐槽分类分布</h3>
                   <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={stats}>
                         <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                         <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                         <Tooltip 
                           cursor={{ fill: 'transparent' }}
                           contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                         />
                         <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {stats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                         </Bar>
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
                 
                 {/* Latest User Info */}
                 <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-bold text-slate-700">最新动态</h3>
                    <div className="space-y-4">
                      {posts.slice(0, 3).map(post => (
                        <div key={post.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <span className="text-xs">👤</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{post.nickname || '匿名'}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{post.content}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: zhCN })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>

              {/* Data Table */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">吐槽列表</h3>
                    <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      共 {filteredPosts.length} 条
                    </span>
                  </div>
                  
                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="搜索内容或昵称..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg w-full sm:w-auto appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="all">所有分类</option>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-medium">内容摘要</th>
                        <th className="px-6 py-4 font-medium">发布人</th>
                        <th className="px-6 py-4 font-medium">分类</th>
                        <th className="px-6 py-4 font-medium">IP地址</th>
                        <th className="px-6 py-4 font-medium">数据</th>
                        <th className="px-6 py-4 font-medium">时间</th>
                        <th className="px-6 py-4 font-medium text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {post.image_url && (
                                <img src={post.image_url} alt="" className="h-10 w-10 rounded object-cover border border-slate-200" />
                              )}
                              <p className="line-clamp-2 max-w-xs text-slate-900" title={post.content}>{post.content}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {post.nickname || '匿名'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                              {CATEGORY_LABELS[post.category as keyof typeof CATEGORY_LABELS] || post.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {post.ip_address || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            👍 {post.likes}
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: zhCN })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {post.ip_address && (
                                <button
                                  onClick={() => handleBanIp(post.ip_address!)}
                                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600 hover:shadow-sm transition-all"
                                  title="封禁 IP"
                                >
                                  <Ban size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(post.id)}
                                disabled={isDeleting === post.id}
                                className="rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 hover:shadow-sm transition-all"
                                title="删除"
                              >
                                {isDeleting === post.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredPosts.length === 0 && (
                  <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="text-slate-400" size={24} />
                    </div>
                    <p className="text-lg font-medium text-slate-900">没有找到相关吐槽</p>
                    <p className="text-sm">换个搜索词或分类试试看？</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                      <ImageIcon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">图片文件管理</h3>
                      <p className="text-sm text-slate-500">管理所有上传到 post-images 存储桶的图片</p>
                    </div>
                  </div>
                  <button 
                    onClick={fetchMediaFiles}
                    className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    刷新列表
                  </button>
                </div>

                {mediaFiles.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <ImageIcon className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p>暂无图片文件</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {mediaFiles.map((file) => (
                      <div key={file.id} className="group relative rounded-lg border border-slate-200 bg-slate-50 overflow-hidden hover:shadow-md transition-all">
                        <div className="aspect-square bg-slate-200 relative overflow-hidden">
                          {file.publicUrl ? (
                            <img 
                              src={file.publicUrl} 
                              alt={file.name} 
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                              <ImageIcon size={24} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          <button
                            onClick={() => handleDeleteFile(file.name)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-sm"
                            title="删除图片"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-medium text-slate-700 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-[10px] text-slate-500">
                              {(file.metadata?.size / 1024).toFixed(1)} KB
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {formatDistanceToNow(new Date(file.created_at || file.updated_at), { addSuffix: true, locale: zhCN })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-xl text-red-600">
                      <Flag size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">举报管理</h3>
                      <p className="text-sm text-slate-500">处理用户提交的违规内容举报</p>
                    </div>
                  </div>
                  <button 
                    onClick={fetchReports}
                    className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    刷新列表
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-medium">举报内容 (Post)</th>
                        <th className="px-6 py-4 font-medium">举报理由</th>
                        <th className="px-6 py-4 font-medium">状态</th>
                        <th className="px-6 py-4 font-medium">时间</th>
                        <th className="px-6 py-4 font-medium text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            {report.post ? (
                              <div className="max-w-xs">
                                <p className="line-clamp-2 text-slate-900 mb-1">{report.post.content}</p>
                                <span className="text-xs text-slate-500">ID: {report.post.id}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">内容已被删除</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-600 max-w-xs">
                            {report.reason}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {report.status === 'pending' && '待处理'}
                              {report.status === 'resolved' && '已处理'}
                              {report.status === 'dismissed' && '已忽略'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: zhCN })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {report.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateReportStatus(report.id, 'resolved')}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                    title="标记为已处理"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateReportStatus(report.id, 'dismissed')}
                                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                                    title="忽略此举报"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                              {report.post && (
                                <button
                                  onClick={() => handleDelete(report.post.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                  title="删除帖子"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {reports.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                            暂无举报记录
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                      <Megaphone size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">公告管理</h3>
                      <p className="text-sm text-slate-500">发布全站通知消息</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreateAnnouncement} className="mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">发布新公告</h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      placeholder="输入公告内容..."
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingAnnouncement || !newAnnouncement.trim()}
                      className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {isSubmittingAnnouncement ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      发布
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-purple-200 transition-colors bg-white">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`h-2 w-2 rounded-full ${announcement.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                        <p className={`text-slate-900 ${!announcement.is_active && 'text-slate-400 line-through'}`}>
                          {announcement.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true, locale: zhCN })}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleAnnouncement(announcement.id, announcement.is_active, announcement.content)}
                            className={`text-xs px-2 py-1 rounded border ${
                              announcement.is_active 
                                ? 'border-slate-200 text-slate-600 hover:bg-slate-50' 
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {announcement.is_active ? '下架' : '上架'}
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      暂无公告
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-xl text-red-600">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">安全中心</h3>
                      <p className="text-sm text-slate-500">管理 IP 封禁名单</p>
                    </div>
                  </div>
                  <button 
                    onClick={fetchBannedIps}
                    className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    刷新列表
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-medium">IP 地址</th>
                        <th className="px-6 py-4 font-medium">封禁原因</th>
                        <th className="px-6 py-4 font-medium">封禁时间</th>
                        <th className="px-6 py-4 font-medium text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bannedIps.map((ban) => (
                        <tr key={ban.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-slate-900">
                            {ban.ip_address}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {ban.reason || '无原因'}
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {formatDistanceToNow(new Date(ban.banned_at), { addSuffix: true, locale: zhCN })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleUnbanIp(ban.ip_address)}
                              className="px-3 py-1 text-xs font-medium text-green-600 border border-green-200 rounded hover:bg-green-50 transition-colors"
                            >
                              解封
                            </button>
                          </td>
                        </tr>
                      ))}
                      {bannedIps.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center gap-2">
                              <Shield size={32} className="text-slate-300" />
                              <p>当前没有被封禁的 IP</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">邮件发送测试</h3>
                    <p className="text-sm text-slate-500">发送一条测试消息以验证 SMTP 和 Supabase 邮件服务配置是否正常</p>
                  </div>
                </div>

                <form onSubmit={handleSendTestEmail} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">接收邮箱</label>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSendingEmail}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {isSendingEmail ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      发送测试
                    </button>
                  </div>
                </form>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Settings size={18} className="text-slate-400" />
                  当前邮件配置 (Read-only)
                </h3>
                <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto relative group">
                  <div className="absolute top-2 right-2 px-2 py-1 bg-white/10 rounded text-xs text-white/60">
                    JSON
                  </div>
                  <pre className="text-xs text-slate-300 font-mono leading-relaxed">
                    {JSON.stringify(config.email, null, 2)}
                  </pre>
                </div>
                <div className="mt-4 flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <div className="mt-0.5">⚠️</div>
                  <p>
                    出于安全考虑，无法在后台直接修改配置。如需更改邮件提供商或 SMTP 凭据，请手动编辑服务器上的 <code>parent-rant.config.json</code> 文件并重启服务
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
               <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">系统信息</h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <dt className="text-sm font-medium text-slate-500">站点名称</dt>
                      <dd className="mt-1 text-lg font-semibold text-slate-900">{config.site.name}</dd>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <dt className="text-sm font-medium text-slate-500">ICP 备案号</dt>
                      <dd className="mt-1 text-lg font-semibold text-slate-900">{config.site.icp || '未设置'}</dd>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <dt className="text-sm font-medium text-slate-500">管理员账号</dt>
                      <dd className="mt-1 text-lg font-semibold text-slate-900">{config.security.adminEmails[0]}</dd>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <dt className="text-sm font-medium text-slate-500">图片上传</dt>
                      <dd className="mt-1 text-lg font-semibold text-slate-900">
                        {config.features.allowImageUploads ? '✅ 已启用' : '❌ 已禁用'}
                      </dd>
                    </div>
                  </dl>
               </div>
            </div>
          )}

          {activeTab === 'developer' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                    <Terminal size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">开发者选项</h3>
                    <p className="text-sm text-slate-500">高级操作和调试信息</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Danger Zone - Removed as per request */}
                  {/* 
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                     ...
                  </div> 
                  */}

                  {/* Server Info */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h4 className="font-bold text-slate-700 mb-3">服务器环境信息</h4>
                    {serverInfo ? (
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-slate-500">Node.js 版本</dt>
                          <dd className="font-mono text-slate-900">{serverInfo.nodeVersion}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">运行平台</dt>
                          <dd className="font-mono text-slate-900">{serverInfo.platform}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">环境 (NODE_ENV)</dt>
                          <dd className="font-mono text-slate-900">{serverInfo.env}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">时区</dt>
                          <dd className="font-mono text-slate-900">{serverInfo.timezone}</dd>
                        </div>
                      </dl>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 size={14} className="animate-spin" />
                        正在获取信息...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
