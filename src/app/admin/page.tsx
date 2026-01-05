import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './dashboard-client'
import config from '../../../parent-rant.config.json'
import { cookies } from 'next/headers'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  const bypassCookie = cookieStore.get('admin_bypass_session')
  const isBypassAuth = bypassCookie?.value === 'true'

  const ADMIN_WHITELIST = config.security.adminEmails

  // Double check protection on server side
  const isSupabaseAdmin = user && user.email && ADMIN_WHITELIST.includes(user.email)
  
  if (!isSupabaseAdmin && !isBypassAuth) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminDashboardClient />
    </div>
  )
}