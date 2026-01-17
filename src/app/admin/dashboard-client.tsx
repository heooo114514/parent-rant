'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
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
  unbanIp,
  deletePost
} from '@/app/actions/admin'
import { devFetchTable, devGetTableStats, devSetBypassMode, devGetServerInfo, devUpdateConfig, devBackupProject, devHealthCheck } from '@/app/actions/dev'
import config from '../../../parent-rant.config.json'
import MarkdownEditor from '@/components/MarkdownEditor'

export default function AdminDashboardClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [mediaFiles, setMediaFiles] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [bannedIps, setBannedIps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'reports' | 'announcements' | 'security' | 'email' | 'settings' | 'developer' | 'localdev'>('posts')
  const [testEmail, setTestEmail] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [serverInfo, setServerInfo] = useState<any>(null)
  
  // Render counter for debugging infinite renders
  const renderCount = useRef(0)
  const lastRenderTime = useRef(Date.now())
  
  renderCount.current += 1
  
  useEffect(() => {
    const now = Date.now()
    const timeSinceLastRender = now - lastRenderTime.current
    lastRenderTime.current = now

    if (renderCount.current > 100) {
      console.error('Detected potential infinite render loop (>100 renders). Time since last: ' + timeSinceLastRender + 'ms')
      // Reset counter after warning to avoid spamming but allow detecting new loops
      if (renderCount.current > 200) renderCount.current = 0
    }
  })

  // LocalDev state
  const [devTableData, setDevTableData] = useState<any[]>([])
  const [devSelectedTable, setDevSelectedTable] = useState('posts')
  const [devTableLoading, setDevTableLoading] = useState(false)
  const [devTableStats, setDevTableStats] = useState<any[]>([])
  
  // LocalDev Settings State
  const [devSettings, setDevSettings] = useState({
    debugBorders: false,
    mockLatency: false
  })
  const [devServerInfo, setDevServerInfo] = useState<any>(null)
  const [isBypassLoading, setIsBypassLoading] = useState(false)
  const [isBackupLoading, setIsBackupLoading] = useState(false)
  const [healthChecks, setHealthChecks] = useState<any[]>([])
  const [isHealthChecking, setIsHealthChecking] = useState(false)

  // Fetch Server Info when settings tab is active
  useEffect(() => {
    let isMounted = true
    let interval: NodeJS.Timeout

    if (activeTab === 'localdev' && devSelectedTable === 'server_dev') {
        const fetchInfo = async () => {
            const result = await devGetServerInfo()
            if (result.success && isMounted) {
                setDevServerInfo(result.data)
            }
        }
        fetchInfo()
        interval = setInterval(fetchInfo, 5000) // Poll every 5s
    }

    return () => {
        isMounted = false
        if (interval) clearInterval(interval)
    }
  }, [activeTab, devSelectedTable])

  const handleToggleBypass = async () => {
      if (!devServerInfo) return
      setIsBypassLoading(true)
      const newState = !devServerInfo.bypassMode
      try {
          await devSetBypassMode(newState)
          const result = await devGetServerInfo() // Refresh info
          if (result.success) setDevServerInfo(result.data)
          toast.success(newState ? '后门已开' : '后门锁死')
      } catch (e) {
          toast.error('后门坏了，打不开')
      } finally {
          setIsBypassLoading(false)
      }
  }

  const handleToggleConfig = async (keyPath: string, currentValue: boolean) => {
      try {
          const result = await devUpdateConfig(keyPath, !currentValue)
          if (result.success) {
              toast.success('改好了，重启一下生效')
              // In a real app we might need to revalidate/refresh props, 
              // but since config is imported JSON, it requires server restart usually.
              // However, we can optimistically update local state if we had it.
              setTimeout(() => window.location.reload(), 1000)
          } else {
              toast.error('没改成功: ' + result.message)
          }
      } catch (e) {
          toast.error('改配置出错了')
      }
  }

  const handleBackup = async () => {
      setIsBackupLoading(true)
      try {
          const result = await devBackupProject()
          if (result.success) {
              toast.success(result.message)
          } else {
              toast.error(result.message)
          }
      } catch (e) {
          toast.error('备份彻底炸了')
      } finally {
          setIsBackupLoading(false)
      }
  }

  const runHealthCheck = async () => {
      setIsHealthChecking(true)
      try {
          const result = await devHealthCheck()
          if (result.success) {
              setHealthChecks(result.data)
              toast.success('体检做完了')
          } else {
              toast.error('医生跑路了')
          }
      } catch (e) {
          toast.error('体检设备坏了')
      } finally {
          setIsHealthChecking(false)
      }
  }

  const CONFIG_DESCRIPTIONS: Record<string, string> = {
    'allowImageUploads': '准许大家传图',
    'allowAnonymousComments': '没名字也能瞎起哄',
    'requireEmailVerification': '没邮箱验证闭嘴',
  }

  // Apply Debug Borders
  useEffect(() => {
    if (devSettings.debugBorders) {
      const style = document.createElement('style')
      style.id = 'debug-borders'
      style.innerHTML = '* { outline: 1px solid rgba(255, 0, 0, 0.2) !important; }'
      document.head.appendChild(style)
    } else {
      const style = document.getElementById('debug-borders')
      if (style) style.remove()
    }
    return () => {
        const style = document.getElementById('debug-borders')
        if (style) style.remove()
    }
  }, [devSettings.debugBorders])
  
  // Announcement form state
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false)
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error('加载崩了，再试次？')
    } else {
      setPosts(data as Post[])
    }
    setIsLoading(prev => prev ? false : prev)
  }, [supabase])

  const fetchMediaFiles = useCallback(async () => {
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
  }, [])

  const fetchServerInfo = useCallback(async () => {
    try {
      const info = await getServerInfo()
      setServerInfo(info)
    } catch (error) {
      console.error('Failed to fetch server info:', error)
    }
  }, [])

  const fetchReports = useCallback(async () => {
    try {
      const result = await getReports()
      if (result.success) {
        setReports(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    }
  }, [])

  const fetchAnnouncements = useCallback(async () => {
    try {
      const result = await getAnnouncements()
      if (result.success) {
        setAnnouncements(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    }
  }, [])

  const fetchBannedIps = useCallback(async () => {
    try {
      const result = await getBannedIps()
      if (result.success) {
        setBannedIps(result.data)
      }
    } catch (error) {
      // console.error('Failed to fetch banned ips:', error)
    }
  }, [])

  const fetchDevData = useCallback(async (table: string) => {
    if (table === 'server_dev' || table === 'client_dev') {
      setDevTableData(prev => prev.length === 0 ? prev : [])
      return
    }
    setDevTableLoading(true)
    try {
      const result = await devFetchTable(table)
      if (result.success) {
        setDevTableData(result.data)
      } else {
        toast.error('查询失败: ' + result.message)
      }
    } catch (error) {
      toast.error('查询出错')
    } finally {
      setDevTableLoading(false)
    }
  }, [])

  const fetchDevStats = useCallback(async () => {
      try {
          const result = await devGetTableStats()
          if (result.success) {
              // Only update if data changed (simple length check for now)
              setDevTableStats(prev => {
                  if (JSON.stringify(prev) === JSON.stringify(result.data)) return prev
                  return result.data
              })
          }
      } catch (e) {}
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      // Load posts first as it's most important
      await fetchPosts()
      
      if (isMounted) {
        // Load secondary data in parallel to save time, 
        // though they still trigger individual state updates.
        // In a more complex app, we'd use a single state object for these.
        Promise.all([
          fetchServerInfo(),
          fetchMediaFiles(),
          fetchReports(),
          fetchAnnouncements(),
          fetchBannedIps()
        ])
      }
    }

    loadData()
    
    return () => {
      isMounted = false
    }
  }, [fetchPosts, fetchServerInfo, fetchMediaFiles, fetchReports, fetchAnnouncements, fetchBannedIps])

  useEffect(() => {
    if (activeTab === 'localdev') {
        fetchDevStats()
        fetchDevData(devSelectedTable)
    }
  }, [activeTab, devSelectedTable, fetchDevStats, fetchDevData])

  const handleBanIp = async (ip: string, reason: string = '违反社区规定') => {
    if (!ip) {
      toast.error('这 IP 谁啊？不认识')
      return
    }
    if (!confirm(`真要让这 IP (${ip}) 滚蛋？`)) return

    try {
      const result = await banIp(ip, reason)
      if (result.success) {
        toast.success('走你！封掉了')
        fetchBannedIps()
      } else {
        toast.error('没封成: ' + result.message)
      }
    } catch (error) {
      toast.error('封号失败，他命大')
    }
  }

  const handleUnbanIp = async (ip: string) => {
    if (!confirm(`算了，放这 IP (${ip}) 一马？`)) return

    try {
      const result = await unbanIp(ip)
      if (result.success) {
        toast.success('行吧，他回来了')
        fetchBannedIps()
      } else {
        toast.error('解不动: ' + result.message)
      }
    } catch (error) {
      toast.error('解封失败')
    }
  }

  const handleUpdateReportStatus = async (id: string, status: 'resolved' | 'dismissed') => {
    try {
      const result = await updateReportStatus(id, status)
      if (result.success) {
        toast.success('处理完咯')
        fetchReports()
      } else {
        toast.error('更新失败，再点点看？')
      }
    } catch (error) {
      toast.error('操作崩了')
    }
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnnouncement.trim()) return

    setIsSubmittingAnnouncement(true)
    try {
      const result = await createAnnouncement(newAnnouncement, true)
      if (result.success) {
        toast.success('大喇叭喊出去咯')
        setNewAnnouncement('')
        fetchAnnouncements()
      } else {
        console.error('Create announcement failed:', result)
        toast.error(`喊话失败: ${result.message}`)
      }
    } catch (error) {
      console.error('Create announcement error:', error)
      toast.error('喊话崩了: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsSubmittingAnnouncement(false)
    }
  }

  const handleToggleAnnouncement = async (id: string, currentStatus: boolean, content: string) => {
    try {
      const result = await updateAnnouncement(id, content, !currentStatus)
      if (result.success) {
        toast.success('开关拨好啦')
        fetchAnnouncements()
      }
    } catch (error) {
      toast.error('开关卡住了')
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('这公告真不要了？')) return
    try {
      const result = await deleteAnnouncement(id)
      if (result.success) {
        toast.success('撕掉咯')
        fetchAnnouncements()
      }
    } catch (error) {
      toast.error('撕不掉，真粘手')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('这帖真删了？后悔药没得吃哦')) return

    setIsDeleting(id)
    
    // Check if post has an image and delete it
    const post = posts.find(p => p.id === id)
    if (post && post.image_url) {
      const fileName = post.image_url.split('/').pop()
      if (fileName) {
        await deleteStorageFile(fileName)
      }
    }

    const result = await deletePost(id)

    if (!result.success) {
      toast.error('删不动: ' + result.message)
    } else {
      toast.success('清理干净了')
      setPosts(posts.filter(p => p.id !== id))
      // Refresh media files
      fetchMediaFiles()
    }
    setIsDeleting(null)
  }

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm('图删了可就没了，确定？')) return
    
    const result = await deleteStorageFile(fileName)
    if (result.success) {
      toast.success('图片消失术！')
      setMediaFiles(mediaFiles.filter(f => f.name !== fileName))
    } else {
      toast.error('销毁失败: ' + result.message)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }
  
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testEmail.trim()) {
      toast.error('邮箱写哪儿啊？')
      return
    }

    setIsSendingEmail(true)
    try {
      const result = await sendTestEmail(testEmail)
      if (result.success) {
        toast.success('送信鸟出发啦')
        setTestEmail('')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('鸟飞丢了，发送失败')
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
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-white font-mono">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-black text-white border-r-4 border-black transition-transform duration-300 ease-in-out md:translate-x-0 hidden md:flex flex-col">
        <div className="flex h-16 items-center gap-2 px-6 font-bold text-xl border-b-2 border-white">
          <LayoutDashboard className="text-[#00ff00]" />
          <span className="uppercase tracking-widest">ParentRant</span>
        </div>
        
        <nav className="flex-1 space-y-2 px-3 py-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold border-2 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none ${
              activeTab === 'posts' 
                ? 'bg-[#00ff00] text-black border-white' 
                : 'bg-black text-white border-white hover:bg-white hover:text-black'
            }`}
          >
            <BarChartIcon size={20} />
            烂帖清理
          </button>
          
          <button
            onClick={() => setActiveTab('media')}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold border-2 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none ${
              activeTab === 'media' 
                ? 'bg-[#00ff00] text-black border-white' 
                : 'bg-black text-white border-white hover:bg-white hover:text-black'
            }`}
          >
            <ImageIcon size={20} />
            图片仓库
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold border-2 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none ${
              activeTab === 'reports' 
                ? 'bg-[#00ff00] text-black border-white' 
                : 'bg-black text-white border-white hover:bg-white hover:text-black'
            }`}
          >
            <Flag size={20} />
            打小报告
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold border-2 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none ${
              activeTab === 'announcements' 
                ? 'bg-[#00ff00] text-black border-white' 
                : 'bg-black text-white border-white hover:bg-white hover:text-black'
            }`}
          >
            <Megaphone size={20} />
            大喇叭
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold border-2 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none ${
              activeTab === 'security' 
                ? 'bg-[#00ff00] text-black border-white' 
                : 'bg-black text-white border-white hover:bg-white hover:text-black'
            }`}
          >
            <Shield size={20} />
            封号基地
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold border-2 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none ${
              activeTab === 'email' 
                ? 'bg-[#00ff00] text-black border-white' 
                : 'bg-black text-white border-white hover:bg-white hover:text-black'
            }`}
          >
            <Mail size={20} />
            送信鸟
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold border-2 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none ${
              activeTab === 'settings' 
                ? 'bg-[#00ff00] text-black border-white' 
                : 'bg-black text-white border-white hover:bg-white hover:text-black'
            }`}
          >
            <Settings size={20} />
            改改配置
          </button>

          <button
            onClick={() => setActiveTab('developer')}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold border-2 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none ${
              activeTab === 'developer' 
                ? 'bg-[#00ff00] text-black border-white' 
                : 'bg-black text-white border-white hover:bg-white hover:text-black'
            }`}
          >
            <Code size={20} />
            程序猿专区
          </button>

          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => setActiveTab('localdev')}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold border-2 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none ${
                activeTab === 'localdev' 
                  ? 'bg-[#ffc0cb] text-black border-white' 
                  : 'bg-black text-white border-white hover:bg-white hover:text-black'
              }`}
            >
              <Terminal size={20} />
              内部搞机
            </button>
          )}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 px-3">
              <div className="border-2 border-dashed border-black p-2 text-[10px] font-mono text-black">
                <p className="font-bold uppercase mb-1 border-b border-black">Perf Monitor</p>
                <p>Renders: {renderCount.current}</p>
                <p>Active Tab: {activeTab}</p>
                {renderCount.current > 100 && (
                  <p className="text-red-600 font-bold mt-1 animate-pulse">!! LOOP DETECTED !!</p>
                )}
              </div>
            </div>
          )}
        </nav>

        <div className="border-t-2 border-white p-4">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="h-10 w-10 bg-white border-2 border-white flex items-center justify-center text-black">
              <User size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold text-white">管理员</p>
              <div className="flex flex-col">
                 <p className="truncate text-xs text-[#00ff00]">
                  {config.security.adminEmails[0]}
                 </p>
                 <p className="text-[10px] text-yellow-300 mt-1">
                   (Configured)
                 </p>
              </div>
            </div>
          </div>
          <div className="px-2 mb-2 text-[10px] text-gray-400">
            <p>Auth Status Check:</p>
            {/* Simple client-side check indicator for debugging */}
            <p className="truncate">
               Cookie: {typeof document !== 'undefined' && document.cookie.includes('sb-') ? 'Yes' : 'No'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 border-2 border-[#ffc0cb] bg-transparent px-4 py-2 text-sm font-bold text-[#ffc0cb] hover:bg-[#ffc0cb] hover:text-black transition-colors shadow-[4px_4px_0px_0px_#ffc0cb] hover:translate-y-1 hover:shadow-none"
          >
            <LogOut size={16} />
            闪人/下班
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen bg-[#f0f0f0]">
        <header className="sticky top-0 z-40 bg-white border-b-4 border-black shadow-[0_4px_0_0_rgba(0,0,0,0.1)]">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-black text-black uppercase tracking-tighter">
              {activeTab === 'posts' && 'DASHBOARD / 瞅瞅数据'}
              {activeTab === 'media' && 'MEDIA / 看看图'}
              {activeTab === 'reports' && 'REPORTS / 谁在捣乱'}
              {activeTab === 'announcements' && 'NOTICES / 广播一下'}
              {activeTab === 'security' && 'SECURITY / 封他号'}
              {activeTab === 'email' && 'EMAIL / 发个信'}
              {activeTab === 'settings' && 'SETTINGS / 瞎鼓捣'}
              {activeTab === 'developer' && 'DEV / 别乱动'}
              {activeTab === 'localdev' && 'LOCAL DEV / 别点'}
            </h2>
            <Link href="/" className="text-sm font-bold text-black border-2 border-black px-3 py-1 hover:bg-[#00ff00] transition-colors shadow-[2px_2px_0_0_black] hover:shadow-none hover:translate-y-[2px]">
              回前台瞅瞅 &rarr;
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {/* Stats Charts Row 1 */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {/* Quick Stats */}
                 <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                   <h3 className="mb-4 text-xl font-black text-black uppercase">大概瞅瞅</h3>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="border-2 border-black bg-[#00ff00] p-4 text-center shadow-[4px_4px_0_0_black]">
                       <div className="text-3xl font-black text-black">{posts.length}</div>
                       <div className="text-xs font-bold text-black uppercase">一共多少怨气</div>
                     </div>
                     <div className="border-2 border-black bg-[#ffc0cb] p-4 text-center shadow-[4px_4px_0_0_black]">
                       <div className="text-3xl font-black text-black">
                         {posts.reduce((acc, curr) => acc + (curr.likes || 0), 0)}
                       </div>
                       <div className="text-xs font-bold text-black uppercase">大家觉得赞的</div>
                     </div>
                   </div>
                 </div>

                 {/* Trend Chart */}
                 <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:col-span-2">
                   <h3 className="mb-4 text-xl font-black text-black uppercase">这周怨气咋样</h3>
                   <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={trendStats}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" />
                         <XAxis dataKey="dateStr" fontSize={12} tickLine={false} axisLine={{stroke: '#000', strokeWidth: 2}} tick={{fill: '#000', fontWeight: 'bold'}} />
                         <YAxis fontSize={12} tickLine={false} axisLine={{stroke: '#000', strokeWidth: 2}} allowDecimals={false} tick={{fill: '#000', fontWeight: 'bold'}} />
                         <Tooltip 
                           contentStyle={{ border: '2px solid black', borderRadius: '0', boxShadow: '4px 4px 0px 0px black', background: 'white' }}
                           itemStyle={{ color: 'black', fontWeight: 'bold' }}
                         />
                         <Line type="monotone" dataKey="count" stroke="#000" strokeWidth={3} dot={{r: 4, fill: '#000', strokeWidth: 0}} activeDot={{r: 6, fill: '#00ff00', stroke: '#000', strokeWidth: 2}} />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
              </div>

              {/* Stats Charts Row 2 */}
              <div className="grid gap-6 md:grid-cols-2">
                 <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                   <h3 className="mb-4 text-xl font-black text-black uppercase">都在吐槽啥</h3>
                   <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={stats}>
                         <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={{stroke: '#000', strokeWidth: 2}} tick={{fill: '#000', fontWeight: 'bold'}} />
                         <YAxis fontSize={12} tickLine={false} axisLine={{stroke: '#000', strokeWidth: 2}} allowDecimals={false} tick={{fill: '#000', fontWeight: 'bold'}} />
                         <Tooltip 
                           cursor={{ fill: '#f0f0f0' }}
                           contentStyle={{ border: '2px solid black', borderRadius: '0', boxShadow: '4px 4px 0px 0px black' }}
                         />
                         <Bar dataKey="count" fill="#000" radius={[0, 0, 0, 0]}>
                            {stats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#000' : '#00ff00'} stroke="#000" strokeWidth={2} />
                            ))}
                         </Bar>
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
                 
                 {/* Latest User Info */}
                 <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="mb-4 text-xl font-black text-black uppercase">刚冒出来的</h3>
                    <div className="space-y-4">
                      {posts.slice(0, 3).map(post => (
                        <div key={post.id} className="flex items-start gap-3 pb-3 border-b-2 border-black last:border-0 last:pb-0">
                          <div className="h-8 w-8 bg-black flex items-center justify-center shrink-0 text-white font-bold border-2 border-black">
                            <span>@</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-black">{post.nickname || 'ANON'}</p>
                            <p className="text-xs text-black font-medium line-clamp-1">{post.content}</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: zhCN })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>

              {/* Data Table */}
              <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="px-6 py-4 border-b-2 border-black bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-black uppercase">烂帖堆</h3>
                    <span className="text-xs font-bold text-white bg-black px-2 py-0.5 border border-black">
                      {filteredPosts.length}
                    </span>
                  </div>
                  
                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={16} />
                      <input 
                        type="text" 
                        placeholder="搜搜看..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border-2 border-black w-full sm:w-64 focus:outline-none focus:ring-0 focus:bg-[#00ff00] transition-colors font-bold placeholder:text-gray-500"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={16} />
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="pl-9 pr-8 py-2 text-sm border-2 border-black w-full sm:w-auto appearance-none bg-white focus:outline-none focus:ring-0 focus:bg-[#00ff00] transition-colors font-bold"
                      >
                        <option value="all">全部分类</option>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-black text-white uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">说了啥</th>
                        <th className="px-6 py-4">谁发的</th>
                        <th className="px-6 py-4">属于啥</th>
                        <th className="px-6 py-4">哪儿来的</th>
                        <th className="px-6 py-4">赞数</th>
                        <th className="px-6 py-4">啥时候</th>
                        <th className="px-6 py-4 text-right">搞他</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black">
                      {filteredPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-[#00ff00]/20 transition-colors font-medium">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {post.image_url && (
                                <img src={post.image_url} alt="" className="h-10 w-10 object-cover border-2 border-black shadow-[2px_2px_0_0_black]" />
                              )}
                              <p className="line-clamp-2 max-w-xs text-black" title={post.content}>{post.content}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-black font-bold">
                            {post.nickname || '匿名'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="border-2 border-black bg-white px-2 py-1 text-xs font-bold text-black shadow-[2px_2px_0_0_black]">
                              {CATEGORY_LABELS[post.category as keyof typeof CATEGORY_LABELS] || post.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-black bg-[#f0f0f0] px-2 py-1 border border-black">
                              {post.ip_address || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-black font-bold">
                            👍 {post.likes}
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-bold text-xs uppercase">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: zhCN })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {post.ip_address && (
                                <button
                                  onClick={() => handleBanIp(post.ip_address!)}
                                  className="border-2 border-black p-2 text-black hover:bg-black hover:text-white hover:shadow-[2px_2px_0_0_#ff0000] transition-all"
                                  title="封禁 IP"
                                >
                                  <Ban size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(post.id)}
                                disabled={isDeleting === post.id}
                                className="border-2 border-black p-2 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 hover:shadow-[2px_2px_0_0_black] transition-all"
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
                  <div className="p-12 text-center text-black flex flex-col items-center bg-white">
                    <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-4 border-2 border-black shadow-[4px_4px_0_0_#00ff00]">
                      <Search size={24} />
                    </div>
                    <p className="text-lg font-black uppercase">没有找到相关吐槽</p>
                    <p className="text-sm font-bold mt-2">TRY ANOTHER SEARCH TERM</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-black text-white border-2 border-black shadow-[4px_4px_0_0_#00ff00]">
                      <ImageIcon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-black uppercase">图都在这</h3>
                      <p className="text-sm font-bold text-gray-600">看看大家都传了啥稀奇古怪的图</p>
                    </div>
                  </div>
                  <button 
                    onClick={fetchMediaFiles}
                    className="px-4 py-2 text-sm font-bold text-black border-2 border-black hover:bg-[#00ff00] hover:shadow-[4px_4px_0_0_black] transition-all"
                  >
                    再找找
                  </button>
                </div>

                {mediaFiles.length === 0 ? (
                  <div className="text-center py-12 text-black bg-[#f0f0f0] border-2 border-dashed border-black">
                    <ImageIcon className="mx-auto h-12 w-12 text-black mb-3" />
                    <p className="font-bold">一张图都没有，真穷</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {mediaFiles.map((file) => (
                      <div key={file.id} className="group relative border-2 border-black bg-white overflow-hidden hover:shadow-[4px_4px_0_0_black] transition-all">
                        <div className="aspect-square bg-gray-100 relative overflow-hidden border-b-2 border-black">
                          {file.publicUrl ? (
                            <img 
                              src={file.publicUrl} 
                              alt={file.name} 
                              className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-black">
                              <ImageIcon size={24} />
                            </div>
                          )}
                          <button
                            onClick={() => handleDeleteFile(file.name)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-[2px_2px_0_0_black]"
                            title="搞掉这张图"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-bold text-black truncate" title={file.name}>
                            {file.name}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-[10px] font-mono text-gray-600">
                              {(file.metadata?.size / 1024).toFixed(1)} KB
                            </p>
                            <p className="text-[10px] font-mono text-gray-600">
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
              <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-600 text-white border-2 border-black shadow-[4px_4px_0_0_black]">
                      <Flag size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-black uppercase">有人告状</h3>
                      <p className="text-sm font-bold text-gray-600">看看谁又被举报了，该封封，该删删</p>
                    </div>
                  </div>
                  <button 
                    onClick={fetchReports}
                    className="px-4 py-2 text-sm font-bold text-black border-2 border-black hover:bg-[#00ff00] hover:shadow-[4px_4px_0_0_black] transition-all"
                  >
                    看看谁告状
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-2 border-black">
                    <thead className="bg-black text-white uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">被举报的帖子</th>
                        <th className="px-6 py-4">为啥告他</th>
                        <th className="px-6 py-4">处理没</th>
                        <th className="px-6 py-4">啥时候</th>
                        <th className="px-6 py-4 text-right">搞他</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black">
                      {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-red-50 transition-colors font-medium">
                          <td className="px-6 py-4">
                            {report.post ? (
                              <div className="max-w-xs">
                                <p className="line-clamp-2 text-black mb-1 font-bold">{report.post.content}</p>
                                <span className="text-xs text-gray-500 font-mono">ID: {report.post.id}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic font-bold">内容已被删除</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-black max-w-xs">
                            {report.reason}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-bold border-2 border-black shadow-[2px_2px_0_0_black] ${
                              report.status === 'pending' ? 'bg-yellow-300 text-black' :
                              report.status === 'resolved' ? 'bg-[#00ff00] text-black' :
                              'bg-gray-200 text-black'
                            }`}>
                              {report.status === 'pending' && '等着呢'}
                              {report.status === 'resolved' && '搞定了'}
                              {report.status === 'dismissed' && '没理他'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 whitespace-nowrap font-mono text-xs">
                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: zhCN })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {report.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateReportStatus(report.id, 'resolved')}
                                    className="p-1.5 border-2 border-black bg-[#00ff00] text-black hover:translate-y-0.5 hover:shadow-none shadow-[2px_2px_0_0_black] transition-all"
                                    title="标记为搞定了"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateReportStatus(report.id, 'dismissed')}
                                    className="p-1.5 border-2 border-black bg-gray-200 text-black hover:translate-y-0.5 hover:shadow-none shadow-[2px_2px_0_0_black] transition-all"
                                    title="懒得理他"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                              {report.post && (
                                <button
                                  onClick={() => handleDelete(report.post.id)}
                                  className="p-1.5 border-2 border-black bg-red-600 text-white hover:translate-y-0.5 hover:shadow-none shadow-[2px_2px_0_0_black] transition-all"
                                  title="直接删帖"
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
                          <td colSpan={5} className="px-6 py-12 text-center text-black font-bold">
                            天下太平，没人告状
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
              <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#ffc0cb] text-black border-2 border-black shadow-[4px_4px_0_0_black]">
                      <Megaphone size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-black uppercase">大喇叭广播</h3>
                      <p className="text-sm font-bold text-gray-600">给所有人都喊一嗓子</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreateAnnouncement} className="mb-8 bg-[#f0f0f0] p-4 border-2 border-black">
                  <h4 className="text-sm font-black text-black mb-3 uppercase">发个新广播</h4>
                  <div className="flex flex-col gap-4">
                    <MarkdownEditor
                      content={newAnnouncement}
                      onChange={setNewAnnouncement}
                      placeholder="想喊点啥？支持 Markdown 语法哦"
                      minHeight="min-h-[150px]"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingAnnouncement || !newAnnouncement.trim()}
                        className="flex items-center gap-2 bg-black px-6 py-2 font-bold text-white border-2 border-black hover:bg-[#00ff00] hover:text-black hover:shadow-[4px_4px_0_0_black] disabled:opacity-50 transition-all"
                      >
                        {isSubmittingAnnouncement ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        喊出去
                      </button>
                    </div>
                  </div>
                </form>

                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="flex items-center justify-between p-4 border-2 border-black hover:shadow-[4px_4px_0_0_black] transition-all bg-white">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`h-3 w-3 border-2 border-black ${announcement.is_active ? 'bg-[#00ff00]' : 'bg-gray-300'}`} />
                        <p className={`text-black font-bold ${!announcement.is_active && 'text-gray-400 line-through'}`}>
                          {announcement.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <span className="text-xs text-gray-500 font-mono font-bold">
                          {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true, locale: zhCN })}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleAnnouncement(announcement.id, announcement.is_active, announcement.content)}
                            className={`text-xs px-2 py-1 border-2 border-black font-bold shadow-[2px_2px_0_0_black] hover:shadow-none hover:translate-y-0.5 transition-all ${
                              announcement.is_active 
                                ? 'bg-white text-black' 
                                : 'bg-[#00ff00] text-black'
                            }`}
                          >
                            {announcement.is_active ? '闭嘴' : '开喊'}
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            className="p-1.5 text-red-600 border-2 border-black hover:bg-red-600 hover:text-white hover:shadow-[2px_2px_0_0_black] transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <div className="text-center py-8 text-black font-bold">
                      没啥好喊的
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-600 text-white border-2 border-black shadow-[4px_4px_0_0_black]">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-black uppercase">封人中心</h3>
                      <p className="text-sm font-bold text-gray-600">看看哪些倒霉蛋被封了</p>
                    </div>
                  </div>
                  <button 
                    onClick={fetchBannedIps}
                    className="px-4 py-2 text-sm font-bold text-black border-2 border-black hover:bg-[#00ff00] hover:shadow-[4px_4px_0_0_black] transition-all"
                  >
                    刷新黑名单
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-2 border-black">
                    <thead className="bg-black text-white uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">IP 地址</th>
                        <th className="px-6 py-4">为啥封他</th>
                        <th className="px-6 py-4">啥时候封的</th>
                        <th className="px-6 py-4 text-right">搞他</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black">
                      {bannedIps.map((ban) => (
                        <tr key={ban.id} className="hover:bg-red-50 transition-colors font-medium">
                          <td className="px-6 py-4 font-mono text-black font-bold">
                            {ban.ip_address}
                          </td>
                          <td className="px-6 py-4 text-black">
                            {ban.reason || '无原因'}
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                            {formatDistanceToNow(new Date(ban.banned_at), { addSuffix: true, locale: zhCN })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleUnbanIp(ban.ip_address)}
                              className="px-3 py-1 text-xs font-bold text-black border-2 border-black bg-[#00ff00] hover:shadow-[2px_2px_0_0_black] hover:-translate-y-0.5 transition-all"
                            >
                              放他出来
                            </button>
                          </td>
                        </tr>
                      ))}
                      {bannedIps.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-black font-bold">
                            <div className="flex flex-col items-center gap-2">
                              <Shield size={32} className="text-gray-300" />
                              <p>大家都挺老实，没封人</p>
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
              <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-600 text-white border-2 border-black shadow-[4px_4px_0_0_black]">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black uppercase">发个信试试</h3>
                    <p className="text-sm font-bold text-gray-600">看看送信鸟能不能飞到地方</p>
                  </div>
                </div>

                <form onSubmit={handleSendTestEmail} className="bg-[#f0f0f0] p-4 border-2 border-black">
                  <label className="block text-sm font-black text-black mb-2 uppercase">发给谁</label>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="flex-1 border-2 border-black px-4 py-2 focus:bg-white focus:outline-none focus:ring-0 font-bold"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSendingEmail}
                      className="flex items-center gap-2 bg-black px-6 py-2 font-bold text-white border-2 border-black hover:bg-blue-600 hover:text-white hover:shadow-[4px_4px_0_0_black] disabled:opacity-50 transition-all"
                    >
                      {isSendingEmail ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      飞一个试试
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-black text-black mb-4 flex items-center gap-2 uppercase">
                  <Settings size={18} />
                  送信鸟的窝 (只能看)
                </h3>
                <div className="bg-black border-2 border-black p-4 overflow-x-auto relative group">
                  <div className="absolute top-2 right-2 px-2 py-1 bg-white border-2 border-black text-xs font-bold text-black">
                    JSON
                  </div>
                  <pre className="text-xs text-[#00ff00] font-mono leading-relaxed">
                    {JSON.stringify(config.email, null, 2)}
                  </pre>
                </div>
                <div className="mt-4 flex items-start gap-2 text-sm font-bold text-black bg-yellow-300 p-3 border-2 border-black shadow-[4px_4px_0_0_black]">
                  <div className="mt-0.5">⚠️</div>
                  <p>
                    别乱动，改这个得去服务器上改 <code>parent-rant.config.json</code> 文件并重启服务
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
               <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-lg font-black text-black mb-4 uppercase">家底儿</h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="p-4 bg-[#f0f0f0] border-2 border-black">
                      <dt className="text-sm font-bold text-gray-600 uppercase">网站叫啥</dt>
                      <dd className="mt-1 text-lg font-black text-black">{config.site.name}</dd>
                    </div>
                    <div className="p-4 bg-[#f0f0f0] border-2 border-black">
                      <dt className="text-sm font-bold text-gray-600 uppercase">身份证号 (ICP)</dt>
                      <dd className="mt-1 text-lg font-black text-black">{config.site.icp || '没户口'}</dd>
                    </div>
                    <div className="p-4 bg-[#f0f0f0] border-2 border-black">
                      <dt className="text-sm font-bold text-gray-600 uppercase">头儿的邮箱</dt>
                      <dd className="mt-1 text-lg font-black text-black">{config.security.adminEmails[0]}</dd>
                    </div>
                    <div className="p-4 bg-[#f0f0f0] border-2 border-black">
                      <dt className="text-sm font-bold text-gray-600 uppercase">能不能传图</dt>
                      <dd className="mt-1 text-lg font-black text-black">
                        {config.features.allowImageUploads ? '✅ 已启用' : '❌ 已禁用'}
                      </dd>
                    </div>
                  </dl>
               </div>
            </div>
          )}

          {activeTab === 'developer' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-indigo-600 text-white border-2 border-black shadow-[4px_4px_0_0_black]">
                    <Terminal size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black uppercase">程序猿专区</h3>
                    <p className="text-sm font-bold text-gray-600">别乱点，点坏了你赔啊</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Server Info */}
                  <div className="border-2 border-black bg-[#f0f0f0] p-4">
                    <h4 className="font-black text-black mb-3 uppercase">服务器的小秘密</h4>
                    {serverInfo ? (
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-gray-600 font-bold uppercase">Node 几代了</dt>
                          <dd className="font-mono font-bold text-black">{serverInfo.nodeVersion}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-600 font-bold uppercase">在哪儿趴着呢</dt>
                          <dd className="font-mono font-bold text-black">{serverInfo.platform}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-600 font-bold uppercase">啥环境啊 (NODE_ENV)</dt>
                          <dd className="font-mono font-bold text-black">{serverInfo.env}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-600 font-bold uppercase">几点了都 (时区)</dt>
                          <dd className="font-mono font-bold text-black">{serverInfo.timezone}</dd>
                        </div>
                      </dl>
                    ) : (
                      <div className="flex items-center gap-2 text-black font-bold">
                        <Loader2 size={14} className="animate-spin" />
                        等会儿，正查着呢...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'localdev' && (
            <div className="space-y-6 h-full flex flex-col">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                 {/* Sidebar for tables */}
                 <div className="lg:col-span-1 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full max-h-[calc(100vh-200px)]">
                    <div className="p-4 border-b-2 border-black bg-black text-white">
                        <h3 className="font-black uppercase flex items-center gap-2">
                            <Terminal size={18} />
                            秘密花园
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {/* Dev Tools Section */}
                        <div className="px-2 py-1 text-xs font-bold text-gray-500 uppercase">趁手家伙</div>
                        <button
                            onClick={() => setDevSelectedTable('server_dev')}
                            className={`w-full text-left px-4 py-3 font-bold border-2 border-black flex justify-between items-center hover:translate-x-1 transition-all ${
                                devSelectedTable === 'server_dev' 
                                ? 'bg-[#00ff00] text-black shadow-[4px_4px_0_0_black]' 
                                : 'bg-white text-black hover:bg-gray-100'
                            }`}
                        >
                            <span className="uppercase flex items-center gap-2"><Code size={14}/> 服务端黑盒</span>
                        </button>
                        <button
                            onClick={() => setDevSelectedTable('client_dev')}
                            className={`w-full text-left px-4 py-3 font-bold border-2 border-black flex justify-between items-center hover:translate-x-1 transition-all ${
                                devSelectedTable === 'client_dev' 
                                ? 'bg-[#00ff00] text-black shadow-[4px_4px_0_0_black]' 
                                : 'bg-white text-black hover:bg-gray-100'
                            }`}
                        >
                            <span className="uppercase flex items-center gap-2"><LayoutDashboard size={14}/> 浏览器杂技</span>
                        </button>
                        
                        <hr className="border-black border-t-2 my-2" />
                        
                        {/* Database Section */}
                        <div className="px-2 py-1 text-xs font-bold text-gray-500 uppercase">数据库老巢</div>
                        {devTableStats.length > 0 ? devTableStats.map((stat) => (
                            <button
                                key={stat.name}
                                onClick={() => setDevSelectedTable(stat.name)}
                                className={`w-full text-left px-4 py-3 font-bold border-2 border-black flex justify-between items-center hover:translate-x-1 transition-all ${
                                    devSelectedTable === stat.name 
                                    ? 'bg-[#ffc0cb] shadow-[4px_4px_0_0_black]' 
                                    : 'bg-white hover:bg-gray-100'
                                }`}
                            >
                                <span className="uppercase">{stat.name}</span>
                                <span className="bg-black text-white text-xs px-2 py-0.5 rounded-none">{stat.count}</span>
                            </button>
                        )) : (
                            <div className="p-4 text-center">
                                <Loader2 className="animate-spin mx-auto" />
                            </div>
                        )}
                    </div>
                 </div>

                 {/* Main Data View */}
                 <div className="lg:col-span-3 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full max-h-[calc(100vh-200px)]">
                    {devSelectedTable === 'server_dev' ? (
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b-2 border-black bg-[#f0f0f0]">
                                <h3 className="font-black uppercase flex items-center gap-2">
                                    <Code size={18} />
                                    Server Dev Tools
                                </h3>
                            </div>
                            <div className="p-6 space-y-6 overflow-y-auto bg-white">
                                 {/* Server Bypass Mode */}
                                 <div className="flex items-center justify-between p-4 border-2 border-black bg-white hover:shadow-[4px_4px_0_0_black] transition-all">
                                     <div>
                                         <h4 className="font-bold uppercase flex items-center gap-2">
                                             <div className="w-3 h-3 bg-purple-500 border border-black"></div>
                                             Server Security Bypass
                                         </h4>
                                         <p className="text-xs text-gray-600 mt-1 font-bold">Skip IP bans, rate limits (Cookie-based).</p>
                                     </div>
                                     <button 
                                         onClick={handleToggleBypass}
                                         disabled={isBypassLoading}
                                         className={`w-12 h-6 border-2 border-black rounded-full relative transition-colors ${devServerInfo?.bypassMode ? 'bg-[#00ff00]' : 'bg-gray-300'}`}
                                     >
                                         <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-black border border-black rounded-full transition-all ${devServerInfo?.bypassMode ? 'left-[calc(100%-1.25rem)]' : 'left-1'}`} />
                                     </button>
                                 </div>
 
                                 {/* Config Switches */}
                                 <div className="border-2 border-black p-4 bg-white">
                                     <h4 className="font-bold uppercase mb-4 flex items-center gap-2">
                                         <Settings size={18} />
                                         Feature Flags (parent-rant.config.json)
                                     </h4>
                                     <div className="space-y-3">
                                         {Object.entries(config.features).map(([key, value]) => (
                                             <div key={key} className="flex items-center justify-between p-3 bg-gray-100 border border-black">
                                                 <div>
                                                     <div className="text-xs font-bold font-mono">{key}</div>
                                                     <div className="text-[10px] text-gray-600 font-bold">{CONFIG_DESCRIPTIONS[key] || 'No description'}</div>
                                                 </div>
                                                 <button
                                                     onClick={() => handleToggleConfig(`features.${key}`, value as boolean)}
                                                     className={`px-3 py-1 text-xs font-bold border-2 border-black transition-all ${
                                                         value ? 'bg-[#00ff00] text-black shadow-[2px_2px_0_0_black]' : 'bg-gray-300 text-gray-500'
                                                     }`}
                                                 >
                                                     {value ? 'ON' : 'OFF'}
                                                 </button>
                                             </div>
                                         ))}
                                     </div>
                                     <p className="text-[10px] text-gray-500 mt-2 font-bold">* Changes require server restart to take full effect.</p>
                                 </div>

                                 {/* Server Inspector */}
                                 <div className="border-2 border-black p-4 bg-white">
                                     <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold uppercase flex items-center gap-2">
                                            <Shield size={18} />
                                            Server Environment Inspector
                                        </h4>
                                        <button 
                                            onClick={handleBackup}
                                            disabled={isBackupLoading}
                                            className="px-3 py-1 text-xs font-black border-2 border-black bg-[#ffff00] hover:bg-[#00ff00] hover:shadow-[4px_4px_0_0_black] disabled:opacity-50 transition-all flex items-center gap-2"
                                        >
                                            {isBackupLoading ? <Loader2 size={12} className="animate-spin" /> : <Terminal size={12} />}
                                            一键备份项目
                                        </button>
                                     </div>
                                     
                                     {devServerInfo ? (
                                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                             <div className="p-3 bg-gray-100 border border-black">
                                                 <p className="text-gray-500 font-bold uppercase mb-1">Client IP</p>
                                                 <p className="font-mono text-base">{devServerInfo.clientIp}</p>
                                             </div>
                                             <div className="p-3 bg-gray-100 border border-black">
                                                 <p className="text-gray-500 font-bold uppercase mb-1">DB Status</p>
                                                 <div className="flex items-center gap-2">
                                                     <div className={`w-2 h-2 rounded-full ${devServerInfo.dbStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                     <p className="font-mono">{devServerInfo.dbStatus} ({devServerInfo.dbLatency})</p>
                                                 </div>
                                             </div>
                                             <div className="p-3 bg-gray-100 border border-black">
                                                 <p className="text-gray-500 font-bold uppercase mb-1">Uptime</p>
                                                 <p className="font-mono text-base">{devServerInfo.uptime}</p>
                                             </div>
                                             <div className="p-3 bg-gray-100 border border-black">
                                                 <p className="text-gray-500 font-bold uppercase mb-1">Memory</p>
                                                 <p className="font-mono text-base">{devServerInfo.memory?.usage} ({devServerInfo.memory?.free} / {devServerInfo.memory?.total})</p>
                                             </div>
                                             <div className="p-3 bg-gray-100 border border-black">
                                                 <p className="text-gray-500 font-bold uppercase mb-1">Platform</p>
                                                 <p className="font-mono text-base uppercase">{devServerInfo.platform} ({devServerInfo.arch})</p>
                                             </div>
                                             <div className="p-3 bg-gray-100 border border-black">
                                                 <p className="text-gray-500 font-bold uppercase mb-1">Node Version</p>
                                                 <p className="font-mono text-base">{devServerInfo.nodeVersion}</p>
                                             </div>
                                             <div className="col-span-full p-3 bg-black text-[#00ff00] border border-black font-mono overflow-x-auto">
                                                 <p className="text-gray-500 font-bold uppercase mb-2 border-b border-gray-700 pb-1">Request Headers (Keys Only)</p>
                                                 <div className="flex flex-wrap gap-2">
                                                     {devServerInfo.headers.map((h: string) => (
                                                         <span key={h} className="bg-gray-900 px-1 border border-gray-700">{h}</span>
                                                     ))}
                                                 </div>
                                             </div>
                                         </div>
                                     ) : (
                                         <div className="flex items-center justify-center py-8">
                                             <Loader2 className="animate-spin" />
                                         </div>
                                     )}
                                 </div>

                                 {/* Health Checks */}
                                 <div className="border-2 border-black p-4 bg-white">
                                     <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold uppercase flex items-center gap-2">
                                            <AlertTriangle size={18} />
                                            系统体检报告
                                        </h4>
                                        <button 
                                            onClick={runHealthCheck}
                                            disabled={isHealthChecking}
                                            className="px-3 py-1 text-xs font-black border-2 border-black bg-[#00ffff] hover:bg-[#00ff00] hover:shadow-[4px_4px_0_0_black] disabled:opacity-50 transition-all flex items-center gap-2"
                                        >
                                            {isHealthChecking ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                                            开始体检
                                        </button>
                                     </div>

                                     {healthChecks.length > 0 ? (
                                         <div className="space-y-2">
                                             {healthChecks.map((check, idx) => (
                                                 <div key={idx} className={`p-3 border-2 border-black flex items-center justify-between ${
                                                     check.status === 'ok' ? 'bg-green-50' : 
                                                     check.status === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
                                                 }`}>
                                                     <div className="flex items-center gap-3">
                                                         {check.status === 'ok' ? (
                                                             <CheckCircle className="text-green-600" size={18} />
                                                         ) : check.status === 'warning' ? (
                                                             <AlertTriangle className="text-yellow-600" size={18} />
                                                         ) : (
                                                             <XCircle className="text-red-600" size={18} />
                                                         )}
                                                         <div>
                                                             <p className="font-bold text-sm text-black">{check.name}</p>
                                                             <p className="text-xs text-gray-600 font-medium">{check.message}</p>
                                                         </div>
                                                     </div>
                                                     <div className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black ${
                                                         check.status === 'ok' ? 'bg-green-500 text-white' : 
                                                         check.status === 'warning' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
                                                     }`}>
                                                         {check.status}
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     ) : (
                                         <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-black">
                                             <p className="text-xs font-bold text-gray-500 uppercase">点按钮给系统做个体检</p>
                                         </div>
                                     )}
                                 </div>
                            </div>
                        </div>
                    ) : devSelectedTable === 'client_dev' ? (
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b-2 border-black bg-[#f0f0f0]">
                                <h3 className="font-black uppercase flex items-center gap-2">
                                    <LayoutDashboard size={18} />
                                    Client Dev Tools
                                </h3>
                            </div>
                            <div className="p-6 space-y-6 overflow-y-auto bg-white">
                                {/* Debug Borders */}
                                <div className="flex items-center justify-between p-4 border-2 border-black bg-white hover:shadow-[4px_4px_0_0_black] transition-all">
                                    <div>
                                        <h4 className="font-bold uppercase flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 border border-black"></div>
                                            UI Debug Borders
                                        </h4>
                                        <p className="text-xs text-gray-600 mt-1 font-bold">Show outlines on all elements to debug layout structure.</p>
                                    </div>
                                    <button 
                                        onClick={() => setDevSettings(s => ({ ...s, debugBorders: !s.debugBorders }))}
                                        className={`w-12 h-6 border-2 border-black rounded-full relative transition-colors ${devSettings.debugBorders ? 'bg-[#00ff00]' : 'bg-gray-300'}`}
                                    >
                                        <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-black border border-black rounded-full transition-all ${devSettings.debugBorders ? 'left-[calc(100%-1.25rem)]' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Mock Latency */}
                                <div className="flex items-center justify-between p-4 border-2 border-black bg-white hover:shadow-[4px_4px_0_0_black] transition-all">
                                    <div>
                                        <h4 className="font-bold uppercase flex items-center gap-2">
                                            <div className="w-3 h-3 bg-blue-500 border border-black"></div>
                                            Simulate Network Latency
                                        </h4>
                                        <p className="text-xs text-gray-600 mt-1 font-bold">Add artificial delay to dev requests (Experimental).</p>
                                    </div>
                                    <button 
                                        onClick={() => setDevSettings(s => ({ ...s, mockLatency: !s.mockLatency }))}
                                        className={`w-12 h-6 border-2 border-black rounded-full relative transition-colors ${devSettings.mockLatency ? 'bg-[#00ff00]' : 'bg-gray-300'}`}
                                    >
                                        <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-black border border-black rounded-full transition-all ${devSettings.mockLatency ? 'left-[calc(100%-1.25rem)]' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Session Debug Info */}
                                <div className="border-2 border-black p-4 bg-black text-[#00ff00]">
                                    <h4 className="font-bold uppercase mb-2 text-white border-b border-gray-700 pb-2">Session Context</h4>
                                    <pre className="font-mono text-xs overflow-auto">
                                        {JSON.stringify({ 
                                            activeTab, 
                                            settings: devSettings,
                                            env: process.env.NODE_ENV,
                                            timestamp: new Date().toISOString()
                                        }, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 border-b-2 border-black flex justify-between items-center bg-[#f0f0f0]">
                                <h3 className="font-black uppercase flex items-center gap-2">
                                    <Terminal size={18} />
                                    Data Explorer: {devSelectedTable}
                                </h3>
                                <button 
                                    onClick={() => fetchDevData(devSelectedTable)}
                                    className="p-2 border-2 border-black bg-white hover:bg-[#00ff00] hover:shadow-[2px_2px_0_0_black] transition-all"
                                    title="Refresh"
                                >
                                    <Loader2 className={devTableLoading ? 'animate-spin' : ''} size={18} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-auto p-0 bg-white">
                        {devTableLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="animate-spin h-10 w-10" />
                            </div>
                        ) : devTableData.length > 0 ? (
                            <table className="w-full text-left text-xs font-mono">
                                <thead className="bg-black text-white sticky top-0 z-10">
                                    <tr>
                                        {Object.keys(devTableData[0]).map((key) => (
                                            <th key={key} className="px-4 py-2 border-r border-gray-700 whitespace-nowrap uppercase">
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y border-b border-black">
                                    {devTableData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-yellow-50">
                                            {Object.values(row).map((val: any, i) => (
                                                <td key={i} className="px-4 py-2 border-r border-gray-200 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                                                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                <Ban size={48} className="mb-4" />
                                <p className="font-bold">NO DATA FOUND</p>
                            </div>
                        )}
                    </div>
                    <div className="p-2 border-t-2 border-black bg-[#f0f0f0] text-xs font-bold flex justify-between">
                         <span>Rows: {devTableData.length} (Limit 50)</span>
                         <span className="text-gray-500">Read-Only Mode</span>
                    </div>
                 </>
                 )}
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
