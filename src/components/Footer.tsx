import config from '../../parent-rant.config.json'

export default function Footer() {
  return (
    <footer className="mt-auto py-8 text-center text-sm text-slate-400">
      <p>&copy; {new Date().getFullYear()} {config.site.name}. All rights reserved.</p>
      {config.site.icp && (
        <div className="mt-2">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
            {config.site.icp}
          </a>
        </div>
      )}
    </footer>
  )
}