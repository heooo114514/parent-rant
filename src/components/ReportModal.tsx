'use client'

import { useState } from 'react'
import { RoughNotation } from 'react-rough-notation'
import { Flag, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { submitReport } from '@/app/actions/admin'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ReportModalProps {
  postId: string
  isOpen: boolean
  onClose: () => void
}

export default function ReportModal({ postId, isOpen, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      toast.error('哎哎，理由还没写呢！咋能交白卷？')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitReport(postId, reason)
      if (result.success) {
        toast.success('收到！举报信已投递，咱们这就去查房！')
        onClose()
        setReason('')
      } else {
        toast.error('哎呀，提交卡住了: ' + result.message)
      }
    } catch (error) {
      toast.error('完犊子，提交失败了，稍后再试试？')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                <RoughNotation type="highlight" show={true} color="#fde047" padding={2} animationDuration={1000}>
                  这是要搞事情？
                </RoughNotation>
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                哎哟，这条吐槽是咋回事？来跟咱们唠唠。要是它真敢乱来，咱们立马把它清理门户！
              </p>
              
              <form onSubmit={handleSubmit}>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="快说说，这家伙哪里不对劲..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    disabled={isSubmitting}
                  >
                    算了，放过它
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                    正义执行！
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
