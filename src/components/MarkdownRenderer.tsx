import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { cn } from '@/lib/utils'

// Workaround for potential import issues with rehype-raw
const safeRehypeRaw = rehypeRaw as any

interface MarkdownRendererProps {
  content: string
  className?: string
  limitHeight?: boolean
}

export default function MarkdownRenderer({ content, className, limitHeight = false }: MarkdownRendererProps) {
  // If content is null or undefined, return null to avoid errors
  if (!content) return null

  return (
    <div className={cn(
      "prose prose-slate max-w-none break-words",
      "prose-headings:mb-2 prose-headings:mt-4 prose-headings:text-slate-800 prose-headings:font-bold",
      "prose-p:my-2 prose-p:leading-relaxed",
      "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline",
      "prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600",
      "prose-ul:my-2 prose-ul:list-disc prose-ul:pl-6",
      "prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-6",
      "prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:text-blue-600 prose-code:before:content-none prose-code:after:content-none",
      "prose-pre:rounded-lg prose-pre:bg-slate-900 prose-pre:p-4 prose-pre:text-slate-50",
      "prose-img:rounded-lg prose-img:shadow-sm",
      limitHeight && "max-h-[200px] overflow-hidden mask-linear-fade", // Custom class or style for fading effect if needed
      className
    )}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[safeRehypeRaw, rehypeSanitize]}
        components={{
          a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

