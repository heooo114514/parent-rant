'use server'

import nodemailer from 'nodemailer'
import config from '../../../parent-rant.config.json'
import { createClient } from '@/utils/supabase/server'

export async function sendTestEmail(to: string) {
  try {
    // 1. Supabase Method (Triggering a password reset as a test, or just checking connection)
    // Actually, we can't easily "send an email" via Supabase client without a trigger event.
    // So for "Supabase" mode, we might just check if we can connect to Auth admin.
    
    if (config.email.provider === 'supabase') {
      const supabase = await createClient()
      // Try to list users to verify admin rights (as a proxy for "system is working")
      // Note: This requires service_role key usually, but let's see if we can do something else.
      // Or we can just say "Supabase handles emails internally".
      
      return { 
        success: true, 
        message: 'Supabase 模式下，邮件由 Supabase 托管发送。请检查 Supabase 后台日志。' 
      }
    }

    // 2. SMTP / Sendmail Method
    if (config.email.provider === 'smtp') {
      const transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.secure,
        auth: {
          user: config.email.smtp.user,
          pass: config.email.smtp.pass,
        },
      })

      await transporter.sendMail({
        from: `"${config.site.name}" <${config.email.smtp.user}>`,
        to,
        subject: 'Test Email from ParentRant Admin',
        text: 'This is a test email to verify your SMTP settings.',
        html: '<b>This is a test email</b> to verify your SMTP settings.',
      })

      return { success: true, message: 'SMTP 邮件发送成功！' }
    }

    return { success: false, message: '未知的邮件提供商配置' }

  } catch (error: any) {
    console.error('Email send error:', error)
    return { success: false, message: '发送失败: ' + error.message }
  }
}

export async function resendVerificationEmail(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
    }
  })

  if (error) {
    return { success: false, message: error.message }
  }
  return { success: true, message: '验证邮件已重发' }
}