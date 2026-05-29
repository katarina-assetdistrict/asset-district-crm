'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { updateLeadStage } from '@/lib/actions'
import PriorityBadge from './priority-badge'
import { daysSince, formatCurrency } from '@/lib/utils'
import type { Lead, LeadStage } from '@/types/database'
import { Clock, DollarSign } from 'lucide-react'

type LeadWithStageDate = Lead & { stage_changed_at: string }

const STAGES: LeadStage[] = ['New', 'Call Scheduled', 'Call Done', 'Proposal Sent', 'Won', 'Lost']

const columnColors: Record<LeadStage, string> = {
  'New':            'border-t-slate-400',
  'Call Scheduled': 'border-t-blue-400',
  'Call Done':      'border-t-indigo-400',
  'Proposal Sent':  'border-t-purple-400',
  'Won':            'border-t-emerald-400',
  'Lost':           'border-t-red-400',
}

const columnHeaderColors: Record<LeadStage, string> = {
  'New':            'text-slate-600 bg-slate-50',
  'Call Scheduled': 'text-blue-700 bg-blue-50',
  'Call Done':      'text-indigo-700 bg-indigo-50',
  'Proposal Sent':  'text-purple-700 bg-purple-50',
  'Won':            'text-emerald-700 bg-emerald-50',
  'Lost':           'text-red-700 bg-red-50',
}

function KanbanCard({ lead }: { lead: LeadWithStageDate }) {
  const [isPending, startTransition] = useTransition()
  const days = daysSince(lead.stage_changed_at)

  function handleStageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStage = e.target.value as LeadStage
    if (newStage === lead.stage) return
    startTransition(() => updateLeadStage(lead.id, newStage))
  }

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${
        isPending ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <Link href={`/leads/${lead.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">
              {lead.first_name} {lead.last_name}
            </p>
            <p className="text-xs text-slate-500 truncate">{lead.company}</p>
          </div>
          <PriorityBadge priority={lead.priority} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
            {lead.source}
          </span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md truncate max-w-[120px]">
            {lead.service_type}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          {lead.deal_value ? (
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <DollarSign size={12} />
              {formatCurrency(lead.deal_value)}
            </span>
          ) : (
            <span className="text-slate-300">No value</span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {days === 0 ? 'Today' : `${days}d`}
          </span>
        </div>
      </Link>

      <div className="px-4 pb-3 border-t border-slate-100 pt-2.5">
        <select
          defaultValue={lead.stage}
          onChange={handleStageChange}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {STAGES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default function KanbanBoard({ leads }: { leads: LeadWithStageDate[] }) {
  const grouped = new Map<LeadStage, LeadWithStageDate[]>(
    STAGES.map(s => [s, leads.filter(l => l.stage === s)])
  )

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-0 h-full">
      {STAGES.map(stage => {
        const cards = grouped.get(stage) ?? []
        return (
          <div
            key={stage}
            className={`flex flex-col w-72 shrink-0 bg-slate-50 rounded-xl border-t-4 ${columnColors[stage]} border border-slate-200`}
          >
            {/* Column header */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-t-lg ${columnHeaderColors[stage]}`}>
              <span className="text-sm font-semibold">{stage}</span>
              <span className="text-xs font-medium bg-white/70 px-2 py-0.5 rounded-full">
                {cards.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {cards.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-8">No leads</p>
              )}
              {cards.map(lead => (
                <KanbanCard key={lead.id} lead={lead} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
