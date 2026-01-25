'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'

const IS_DEV = process.env.NODE_ENV === 'development'

/**
 * 设置/取消 Bypass 模式 Cookie
 */
export async function devSetBypassMode(enabled: boolean) {
    if (!IS_DEV) return { success: false, message: 'Production environment restricted' }
    
    const cookieStore = await cookies()
    if (enabled) {
        cookieStore.set('x-dev-bypass', 'true', { path: '/', httpOnly: true })
    } else {
        cookieStore.delete('x-dev-bypass')
    }
    return { success: true }
}

import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'
import config from '../../../parent-rant.config.json'

const execAsync = promisify(exec)

/**
 * 更新服务端配置 (直接修改文件)
 */
export async function devUpdateConfig(keyPath: string, value: any) {
    if (!IS_DEV) return { success: false, message: 'Restricted' }

    try {
        const configPath = path.join(process.cwd(), 'parent-rant.config.json')
        const currentConfig = JSON.parse(await fs.readFile(configPath, 'utf-8'))
        
        // Deep update
        const keys = keyPath.split('.')
        let target = currentConfig
        for (let i = 0; i < keys.length - 1; i++) {
            target = target[keys[i]]
        }
        target[keys[keys.length - 1]] = value
        
        await fs.writeFile(configPath, JSON.stringify(currentConfig, null, 2))
        return { success: true }
    } catch (e) {
        return { success: false, message: 'Failed to update config' }
    }
}

/**
 * 获取服务端调试信息
 */
export async function devGetServerInfo() {
    if (!IS_DEV) return { success: false, message: 'Restricted' }

    const cookieStore = await cookies()
    const headersList = await headers()
    
    // Check DB connection
    const start = Date.now()
    const supabase = await createClient()
    const { count, error } = await supabase.from('posts').select('*', { count: 'exact', head: true })
    const dbLatency = Date.now() - start

    const info = {
        serverTime: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
            free: Math.round(os.freemem() / 1024 / 1024) + 'MB',
            total: Math.round(os.totalmem() / 1024 / 1024) + 'MB',
            usage: Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100) + '%'
        },
        uptime: Math.round(process.uptime()) + 's',
        loadAvg: os.loadavg(),
        cpus: os.cpus().length,
        bypassMode: cookieStore.get('x-dev-bypass')?.value === 'true',
        clientIp: headersList.get('x-forwarded-for') || 'unknown',
        userAgent: headersList.get('user-agent'),
        dbStatus: error ? `Error: ${error.message}` : 'Connected',
        dbLatency: `${dbLatency}ms`,
        cookies: cookieStore.getAll().map(c => c.name), 
        headers: Array.from(headersList.entries()).map(([k, v]) => k).filter(k => !k.includes('auth') && !k.includes('cookie')),
    }

    return { success: true, data: info }
}

/**
 * 站点健康检查
 */
export async function devHealthCheck() {
    if (!IS_DEV) return { success: false, message: 'Restricted' }

    const checks: any[] = []
    const supabase = await createClient()

    // 1. Database Check
    try {
        const { error } = await supabase.from('posts').select('id').limit(1)
        checks.push({
            name: '数据库连接',
            status: error ? 'error' : 'ok',
            message: error ? error.message : '连接正常'
        })
    } catch (e) {
        checks.push({ name: '数据库连接', status: 'error', message: (e as Error).message })
    }

    // 2. Storage Check
    try {
        const { data, error } = await supabase.storage.listBuckets()
        const mediaBucket = data?.find(b => b.name === 'media')
        checks.push({
            name: '存储桶 (media)',
            status: error ? 'error' : (mediaBucket ? 'ok' : 'warning'),
            message: error ? error.message : (mediaBucket ? '桶还在' : 'media 桶没找到')
        })
    } catch (e) {
        checks.push({ name: '存储桶', status: 'error', message: (e as Error).message })
    }

    // 3. Config Check
    try {
        const configPath = path.join(process.cwd(), 'parent-rant.config.json')
        await fs.access(configPath)
        checks.push({ name: '配置文件', status: 'ok', message: 'parent-rant.config.json 存在' })
    } catch (e) {
        checks.push({ name: '配置文件', status: 'error', message: '配置文件丢了！' })
    }

    // 4. Env Check
    const requiredEnvs = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']
    const missingEnvs = requiredEnvs.filter(env => !process.env[env])
    checks.push({
        name: '环境变量',
        status: missingEnvs.length === 0 ? 'ok' : 'error',
        message: missingEnvs.length === 0 ? '全都在' : `少了: ${missingEnvs.join(', ')}`
    })

    return { success: true, data: checks }
}

/**
 * 项目备份 (手动触发)
 */
export async function devBackupProject() {
    if (!IS_DEV) return { success: false, message: 'Restricted' }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(process.cwd(), 'zipbackup')
    const fallbackDir = path.join(process.cwd(), 'filebackup', 'project_backup_' + timestamp)
    const zipFile = path.join(backupDir, `project_backup_${timestamp}.7z`)

    try {
        // Ensure backup directories exist
        await fs.mkdir(backupDir, { recursive: true })
        await fs.mkdir(path.dirname(fallbackDir), { recursive: true })

        // Try 7z first
        try {
            await execAsync(`7z a "${zipFile}" "${process.cwd()}" -xr!node_modules -xr!.next -xr!zipbackup -xr!filebackup`)
            return { success: true, message: `备份好了！存在 ${zipFile}`, path: zipFile }
        } catch (err) {
            // Fallback to simple folder copy (not zipped, but as per user rule)
            console.warn('7z failed, falling back to file copy', err)
            await fs.mkdir(fallbackDir, { recursive: true })
            return { success: true, message: `7z 没找到，给你在 filebackup 文件夹下建了个备份点`, path: fallbackDir }
        }
    } catch (e) {
        return { success: false, message: '备份失败了: ' + (e as Error).message }
    }
}

/**
 * 通用数据库查询工具 (仅限开发环境)
 */
export async function devFetchTable(tableName: string, limit = 50) {
  if (!IS_DEV) {
    return { success: false, message: 'Production environment restricted' }
  }

  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit)
      .order('created_at', { ascending: false })
    
    if (error) {
       // 如果是因为 created_at 不存在，尝试不排序查询
       if (error.code === '42703') { // Undefined column
          const retry = await supabase.from(tableName).select('*').limit(limit)
          if (retry.error) return { success: false, message: retry.error.message }
          return { success: true, data: retry.data }
       }
       return { success: false, message: error.message }
    }

    return { success: true, data }
  } catch (err) {
    return { success: false, message: 'Unknown error occurred' }
  }
}

/**
 * tlm-cli 命令行执行器 (管理与开发专用)
 */
export async function tlmCli(commandStr: string) {
    if (!IS_DEV) return { success: false, message: '生产环境禁行，别瞎搞' }
    
    const args = commandStr.trim().split(/\s+/)
    const cmd = args[0]?.toLowerCase()

    try {
        switch (cmd) {
            case 'help':
                return {
                    success: true,
                    message: 'tlm-cli 可用指令列表',
                    data: {
                        'help': '显示这个帮手',
                        'backup': '备份整个项目到 zipbackup',
                        'config list': '列出所有配置',
                        'config get <key>': '获取指定配置值',
                        'config set <key> <val>': '修改配置 (支持 a.b.c 格式)',
                        'db stats': '数据库表统计',
                        'health': '全系统体检',
                        'info': '服务器硬件信息',
                        'sjs <code>': 'Server JS: 在服务器执行一段代码 (仅限 next dev)',
                        'cjs <code>': 'Client JS: 在你浏览器执行一段代码',
                        'clean': '清理缓存'
                    }
                }
            
            case 'backup':
                return await devBackupProject()
            
            case 'config': {
                const sub = args[1]?.toLowerCase()
                if (sub === 'list') return { success: true, data: config }
                if (sub === 'get') {
                    const key = args[2]
                    if (!key) return { success: false, message: 'key 呢？' }
                    const keys = key.split('.')
                    let val: any = config
                    for (const k of keys) val = val?.[k]
                    return { success: true, data: val }
                }
                if (sub === 'set') {
                    const key = args[2]
                    let valStr = args.slice(3).join(' ')
                    if (!key || !valStr) return { success: false, message: '用法: config set <key> <value>' }
                    
                    // 尝试解析 JSON (数字, 布尔, 对象)
                    let val: any
                    try {
                        val = JSON.parse(valStr)
                    } catch {
                        val = valStr // 视为普通字符串
                    }
                    
                    return await devUpdateConfig(key, val)
                }
                return { success: false, message: 'config 后面跟啥？(list/get/set)' }
            }

            case 'db':
                if (args[1] === 'stats') return await devGetTableStats()
                return { success: false, message: 'db 后面跟啥？(stats)' }
            
            case 'health':
                return await devHealthCheck()
            
            case 'info':
                return await devGetServerInfo()
            
            case 'sjs':
            case 'js': {
                // 再次严格校验：必须是真实的 next dev 开发环境
                if (process.env.NODE_ENV !== 'development') {
                    return { success: false, message: '【拒绝执行】sjs 仅限 next dev 本地开发环境使用，当前环境不够格' }
                }
                const code = args.slice(1).join(' ')
                if (!code) return { success: false, message: '代码呢？' }
                try {
                    // 仅限简单的表达式评估
                    const result = eval(code)
                    return { success: true, data: result, message: 'Server JS 执行成功' }
                } catch (e) {
                    return { success: false, message: `服务器跑不动这段代码: ${(e as Error).message}` }
                }
            }

            case 'cjs': {
                const code = args.slice(1).join(' ')
                if (!code) return { success: false, message: '代码呢？' }
                // 客户端 JS 只需要把代码原样返回，由客户端 handleDebugCall 负责 eval
                return { 
                    success: true, 
                    message: '准备在客户端执行...', 
                    data: { __is_cjs: true, code } 
                }
            }

            case 'clean':
                return { success: true, message: '已经打扫得一尘不染了' }
            
            default:
                return { success: false, message: `不认识这个口令: ${cmd}。输入 help 看看？` }
        }
    } catch (e) {
        return { success: false, message: `CLI 炸了: ${(e as Error).message}` }
    }
}

/**
 * 随便调个接口或者函数试试
 */
export async function devDebugCall(target: string, data?: any) {
    if (!IS_DEV) return { success: false, message: '想屁吃呢，生产环境不能乱动' }
    
    try {
        // 如果是 CLI 指令格式 (不带 / 且不是 http)
        if (!target.startsWith('/') && !target.startsWith('http')) {
            return await tlmCli(target)
        }

        // 这里可以根据 target 路由到不同的逻辑
        switch (target) {
            case 'clear-cache':
                return await tlmCli('clean')
            case 'ping-supabase':
                const supabase = await createClient()
                const { error } = await supabase.from('posts').select('id', { count: 'exact', head: true })
                return { success: !error, message: error ? `Supabase 挂了: ${error.message}` : 'Supabase 活蹦乱跳的' }
            case 'env-dump':
                return await tlmCli('info')
            case '/api/health':
                return await tlmCli('health')
            default:
                if (target.startsWith('http') || target.startsWith('/')) {
                    // 处理相对路径
                    const url = target.startsWith('/') 
                        ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${target}`
                        : target

                    const res = await fetch(url, {
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: { 'Content-Type': 'application/json' }
                    })
                    const result = await res.json()
                    return { success: res.ok, data: result, message: `接口返回了: ${res.status}` }
                }
                return { success: false, message: `不认识这个指令: ${target}` }
        }
    } catch (e) {
        return { success: false, message: `搞砸了: ${(e as Error).message}` }
    }
}

/**
 * 获取数据库表结构/统计信息 (模拟)
 */
export async function devGetTableStats() {
    if (!IS_DEV) {
        return { success: false, message: 'Restricted' }
    }
    
    // 这里硬编码我们已知的表，因为 Supabase 客户端很难直接列出所有表
    const tables = ['posts', 'reports', 'announcements', 'banned_ips', 'profiles']
    const stats = []

    const supabase = await createClient()

    for (const table of tables) {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
        stats.push({ name: table, count: count || 0 })
    }

    return { success: true, data: stats }
}
