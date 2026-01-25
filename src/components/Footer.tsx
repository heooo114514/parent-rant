'use client'

import config from '../../parent-rant.config.json'
import { useEffect, useState } from 'react'

export default function Footer() {
  const [year, setYear] = useState<number | null>(null)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="mt-auto border-t-4 border-black bg-white py-16 text-center text-sm text-black font-mono font-black relative z-10">
      <div className="container mx-auto px-4">
        <p className="uppercase tracking-widest text-lg">
          &copy; {year || '...'} {config.site.name}. 
          <span className="ml-2 bg-black text-white px-2 py-0.5">ALL RIGHTS RESERVED.</span>
        </p>
        <p className="mt-4 text-xs">
          {config.site.footer}
        </p>
        {config.site.icp && (
          <div className="mt-8 border-2 border-black bg-yellow-400 inline-block px-4 py-1 shadow-[4px_4px_0_0_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:underline">
              {config.site.icp}
            </a>
          </div>
        )}
      </div>
    </footer>
  )
}
