import type { LeadPriority } from '@/types/database'

const styles: Record<LeadPriority, string> = {
  Hot:  'bg-red-100 text-red-700 border-red-200',
  Warm: 'bg-amber-100 text-amber-700 border-amber-200',
  Cold: 'bg-slate-100 text-slate-600 border-slate-200',
}

const dots: Record<LeadPriority, string> = {
  Hot:  'bg-red-500',
  Warm: 'bg-amber-500',
  Cold: 'bg-slate-400',
}

export default function PriorityBadge({
  priority,
  size = 'sm',
}: {
  priority: LeadPriority
  size?: 'sm' | 'md'
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full font-medium ${styles[priority]} ${
        size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[priority]}`} />
      {priority}
    </span>
  )
}
