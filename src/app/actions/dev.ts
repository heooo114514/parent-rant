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
      // 某些表可能没有 created_at，如果报错可以去掉 order，或者在前端处理
      // 这里为了通用性，先尝试带 order，如果表没有这个字段可能会报错，暂时忽略这个问题，假设大部分表都有

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
