'use client'

import { useState, useEffect } from 'react'
import { getActiveAnnouncements } from '@/app/actions/admin'
import { Megaphone, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    async function fetchAnnouncements() {
      const data = await getActiveAnnouncements()
      if (data && data.length > 0) {
        setAnnouncements(data)
      }
    }
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    if (announcements.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [announcements.length])

  if (!isVisible || announcements.length === 0) return null

  return (
    <div className="bg-blue-600 text-white px-4 py-3 relative overflow-hidden">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <Megaphone size={20} className="shrink-0 animate-pulse" />
          <div className="flex-1 relative h-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0 truncate font-medium text-sm sm:text-base flex items-center"
              >
                {announcements[currentIndex].content}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white/80 hover:text-white shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
