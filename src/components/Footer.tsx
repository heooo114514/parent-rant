import config from '../../parent-rant.config.json'

export default function Footer() {
  return (
    <footer className="mt-auto border-t-4 border-black bg-yellow-400 py-10 text-center text-sm text-black font-mono font-black">
      <div className="container mx-auto px-4">
        <p className="uppercase tracking-widest text-lg">
          &copy; {new Date().getFullYear()} {config.site.name}. 
          <span className="ml-2 bg-black text-white px-2 py-0.5">ALL RIGHTS RESERVED.</span>
        </p>
        <p className="mt-4 text-xs">
          用 ❤️ 和 💢 吐槽父母的地方
        </p>
        {config.site.icp && (
          <div className="mt-6 border-2 border-black bg-white inline-block px-4 py-1 shadow-[4px_4px_0_0_black]">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:underline">
              {config.site.icp}
            </a>
          </div>
        )}
      </div>
    </footer>
  )
}
