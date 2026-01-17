import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AnnouncementBanner from '@/components/AnnouncementBanner'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col font-mono relative overflow-x-hidden">
      {/* Background accents */}
      <div className="fixed top-[20%] -left-10 w-40 h-40 bg-pink-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="fixed bottom-[10%] -right-10 w-60 h-60 bg-yellow-200/30 rounded-full blur-3xl -z-10"></div>
      
      <Header />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  )
}