import type { LeadStage } from '@/types/database'

const styles: Record<LeadStage, string> = {
  'New':            'bg-slate-100 text-slate-700',
  'Call Scheduled': 'bg-blue-100 text-blue-700',
  'Call Done':      'bg-indigo-100 text-indigo-700',
  'Proposal Sent':  'bg-purple-100 text-purple-700',
  'Won':            'bg-emerald-100 text-emerald-700',
  'Lost':           'bg-red-100 text-red-700',
}

export default function StageBadge({ stage }: { stage: LeadStage }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${styles[stage]}`}>
      {stage}
    </span>
  )
}
