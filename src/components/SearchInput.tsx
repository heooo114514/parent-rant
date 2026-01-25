'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') || '')
  
  // We'll implement a simple debounce effect inside the component to avoid creating a separate file if possible,
  // or just push on enter. Let's do push on Enter for simplicity first, or simple timeout.
  
  useEffect(() => {
    setValue(searchParams.get('q') || '')
  }, [searchParams])

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="relative hidden w-full max-w-xs md:block">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-black z-10">
        <Search size={16} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(value)
          }
        }}
        onBlur={() => handleSearch(value)}
        placeholder="搜索吐槽..."
        className="w-full rounded-none border-2 border-black bg-white py-2 pl-9 pr-4 text-sm text-black placeholder:text-gray-500 font-mono focus:bg-[var(--secondary-color)] focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--primary-color)] transition-all"
      />
    </div>
  )
}
