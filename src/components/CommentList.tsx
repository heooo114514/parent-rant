import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Comment } from '@/types'
import MarkdownRenderer from './MarkdownRenderer'

interface CommentListProps {
  comments: Comment[]
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500">
        <p>还没有评论，来抢沙发吧！</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="flex flex-col gap-2 border-b border-slate-100 pb-4 last:border-0">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">{comment.nickname || '匿名'}</span>
            <span className="text-xs text-slate-400">
              {(() => {
                try {
                  return formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: zhCN })
                } catch {
                  return '刚刚'
                }
              })()}
            </span>
          </div>
          <div className="text-slate-800 leading-relaxed text-sm">
            <MarkdownRenderer content={comment.content} />
          </div>
        </div>
      ))}
    </div>
  )
}
