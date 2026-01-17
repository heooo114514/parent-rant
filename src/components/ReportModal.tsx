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
            className="relative w-full max-w-md overflow-hidden rounded-none border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="p-6">
              <h3 className="text-xl font-black text-black mb-2 uppercase tracking-tight">
                <RoughNotation type="highlight" show={true} color="#00ff00" padding={2} animationDuration={1000}>
                  这是要搞事情？
                </RoughNotation>
              </h3>
              <p className="text-sm font-bold font-mono text-gray-500 mb-4">
                哎哟，这条吐槽是咋回事？来跟咱们唠唠。要是它真敢乱来，咱们立马把它清理门户！
              </p>
              
              <form onSubmit={handleSubmit}>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="快说说，这家伙哪里不对劲..."
                  rows={4}
                  className="w-full rounded-none border-2 border-black p-3 text-sm font-mono focus:outline-none focus:shadow-[4px_4px_0px_0px_#ffc0cb] transition-all"
                  autoFocus
                />
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-none border-2 border-black px-4 py-2 text-sm font-bold text-black hover:bg-slate-100 transition-all hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none"
                    disabled={isSubmitting}
                  >
                    算了，放过它
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-none border-2 border-black bg-[#00ff00] px-4 py-2 text-sm font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#00cc00] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50"
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
