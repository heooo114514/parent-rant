'use server'

import { cookies } from 'next/headers'
import config from '../../../parent-rant.config.json'

export async function loginWithConfig(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, message: '请输入账号和密码' }
  }

  // Check against config
  const isAdminEmail = config.security.adminEmails.includes(email)
  const isPasswordCorrect = password === config.security.adminPassword

  if (isAdminEmail && isPasswordCorrect) {
    // Set a bypass cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_bypass_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })
    return { success: true }
  }

  return { success: false, message: '账号或密码错误' }
}

export async function logoutWithConfig() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_bypass_session')
  return { success: true }
}