import type { ActivityLog } from '@/types/database'
import { formatDistanceToNow } from '@/lib/utils'
import { Zap, User } from 'lucide-react'

export default function ActivityTimeline({ entries }: { entries: ActivityLog[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-400 py-4 text-center">No activity yet.</p>
  }

  return (
    <ol className="space-y-0">
      {entries.map((entry, i) => (
        <li key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                entry.automated ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {entry.automated ? <Zap size={13} /> : <User size={13} />}
            </div>
            {i < entries.length - 1 && <div className="w-px flex-1 bg-slate-100 my-1" />}
          </div>
          <div className="pb-5 min-w-0">
            <p className="text-sm text-slate-700 leading-snug">{entry.action}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatDistanceToNow(entry.created_at)}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
