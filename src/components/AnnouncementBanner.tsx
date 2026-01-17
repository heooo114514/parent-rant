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
    <div className="bg-[#00ff00] text-black border-b-2 border-black px-4 py-3 relative overflow-hidden font-mono font-bold">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <div className="bg-black text-white p-1 border border-black">
             <Megaphone size={16} className="shrink-0" />
          </div>
          <div className="flex-1 relative h-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 truncate text-sm sm:text-base flex items-center uppercase prose prose-sm prose-p:my-0 prose-p:inline prose-strong:text-black prose-a:text-blue-800 prose-a:underline max-w-none"
                dangerouslySetInnerHTML={{ __html: announcements[currentIndex].content }}
              />
            </AnimatePresence>
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-black hover:bg-black hover:text-white border-2 border-transparent hover:border-black shrink-0 transition-all p-0.5"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
