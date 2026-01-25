'use server'

import { createClient } from '@/utils/supabase/server'
import config from '../../../parent-rant.config.json'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

/**
 * Checks if the current user is an admin
 */
async function isAdmin() {
  // Check for bypass cookie or development mode
  const cookieStore = await cookies()
  const bypassCookie = cookieStore.get('admin_bypass_session')
  const isBypassAuth = bypassCookie?.value === 'true'
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isBypassAuth || isDev) return true

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !user.email) {
    return false
  }
  
  const isAllowed = config.security.adminEmails.includes(user.email)
  return isAllowed
}

/**
 * Delete a post
 */
export async function deletePost(id: string) {
  if (!(await isAdmin())) {
    return { success: false, message: 'Unauthorized' }
  }

  const supabase = await createClient()
  
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/')
  return { success: true, message: 'Post deleted successfully' }
}

/**
 * Deletes all posts from the database (Dangerous!) - Disabled
 */
// export async function clearAllPosts() {
//   if (!(await isAdmin())) {
//     return { success: false, message: 'Unauthorized' }
//   }

//   const supabase = await createClient()
  
//   const { error } = await supabase
//     .from('posts')
//     .delete()
//     .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows where ID is not zero (effectively all)

//   if (error) {
//     return { success: false, message: error.message }
//   }

//   revalidatePath('/')
//   return { success: true, message: 'All posts have been cleared' }
// }

/**
 * Get list of files in the storage bucket
 */
export async function getStorageFiles() {
  if (!(await isAdmin())) {
    return { success: false, message: 'Unauthorized', data: [] }
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .storage
    .from('post-images')
    .list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  if (error) {
    return { success: false, message: error.message, data: [] }
  }

  // Get public URLs for each file
  const filesWithUrls = data.map(file => {
    const { data: { publicUrl } } = supabase
      .storage
      .from('post-images')
      .getPublicUrl(file.name)
    
    return {
      ...file,
      publicUrl
    }
  })

  return { success: true, data: filesWithUrls }
}

/**
 * Delete a file from storage
 */
export async function deleteStorageFile(fileName: string) {
  if (!(await isAdmin())) {
    return { success: false, message: 'Unauthorized' }
  }

  const supabase = await createClient()
  
  const { error } = await supabase
    .storage
    .from('post-images')
    .remove([fileName])

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, message: 'File deleted successfully' }
}

/**
 * Get server-side environment info
 */
export async function getServerInfo() {
  if (!(await isAdmin())) {
    return null
  }

  return {
    nodeVersion: process.version,
    platform: process.platform,
    env: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'local',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

/**
 * Get all reports
 */
export async function getReports() {
  if (!(await isAdmin())) {
    return { success: false, message: 'Unauthorized', data: [] }
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reports')
    .select('*, posts(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getReports error:', error)
    return { success: false, message: error.message, data: [] }
  }

  // Map 'posts' to 'post' to match client expectation
  const reports = data.map((report: any) => ({
    ...report,
    post: report.posts
  }))

  return { success: true, data: reports }
}

/**
 * Update configuration
 */
export async function updateConfig(newConfig: any) {
  if (!(await isAdmin())) {
    return { success: false, message: 'Unauthorized' }
  }

  try {
    const configPath = path.join(process.cwd(), 'parent-rant.config.json')
    await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2))
    revalidatePath('/')
    return { success: true, message: 'Configuration updated successfully' }
  } catch (error) {
    console.error('updateConfig error:', error)
    return { success: false, message: 'Failed to update configuration' }
  }
}

/**
 * Update report status
 */
export async function updateReportStatus(id: string, status: 'resolved' | 'dismissed') {
  if (!(await isAdmin())) {
    return { success: false, message: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', id)

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, message: 'Report updated' }
}

/**
 * Get all announcements (for admin)
 */
export async function getAnnouncements() {
  // Public can read active ones, but admin needs all
  const supabase = await createClient()
  
  // Check if admin to decide whether to show all or just active
  // Actually this function is for admin dashboard, so we assume admin check
  if (!(await isAdmin())) {
     return { success: false, message: 'Unauthorized', data: [] }
  }

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, message: error.message, data: [] }
  }

  return { success: true, data }
}

/**
 * Create announcement
 */
export async function createAnnouncement(content: string, isActive: boolean) {
  if (!(await isAdmin())) {
    return { success: false, message: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('announcements')
    .insert([{ content, is_active: isActive }])

  if (error) {
    return { success: false, message: error.message }
  }
  
  revalidatePath('/')
  return { success: true, message: 'Announcement created' }
}

/**
 * Update announcement
 */
export async function updateAnnouncement(id: string, content: string, isActive: boolean) {
  if (!(await isAdmin())) {
    return { success: false, message: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('announcements')
    .update({ content, is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/')
  return { success: true, message: 'Announcement updated' }
}

/**
 * Delete announcement
 */
export async function deleteAnnouncement(id: string) {
  if (!(await isAdmin())) {
    return { success: false, message: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/')
  return { success: true, message: 'Announcement deleted' }
}

/**
 * Get active announcements (public)
 */
export async function getActiveAnnouncements() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('announcements')
    .select('content')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching announcements:', error)
    return []
  }

  return data
}

/**
 * Submit a report (public)
 */
export async function submitReport(postId: string, reason: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('reports')
    .insert([{ post_id: postId, reason }])

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, message: 'Report submitted' }
}

/**
 * Get all banned IPs
 */
export async function getBannedIps() {
  if (!(await isAdmin())) {
    return { success: false, message: 'Unauthorized', data: [] }
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('banned_ips')
    .select('*')
    .order('banned_at', { ascending: false })

  if (error) {
    return { success: false, message: error.message, data: [] }
  }

  return { success: true, data }
}

/**
 * Ban an IP
 */
export async function banIp(ip: string, reason: string) {
  if (!(await isAdmin())) {
    return { success: false, message: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('banned_ips')
    .insert([{ ip_address: ip, reason, banned_by: user?.id }])

  if (error) {
    // Check for unique violation (already banned)
    if (error.code === '23505') {
      return { success: false, message: '该 IP 已经被封禁' }
    }
    return { success: false, message: error.message }
  }

  return { success: true, message: 'IP 已封禁' }
}

/**
 * Unban an IP
 */
export async function unbanIp(ip: string) {
  if (!(await isAdmin())) {
    return { success: false, message: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('banned_ips')
    .delete()
    .eq('ip_address', ip)

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, message: 'IP 已解封' }
}
