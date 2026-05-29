'use client'

import { useState, useTransition } from 'react'
import { updateLeadStage, updateLeadPriority, updateLeadDealValue } from '@/lib/actions'
import type { Lead, LeadStage, LeadPriority } from '@/types/database'
import { Pencil, Check, X } from 'lucide-react'

const STAGES: LeadStage[] = ['New', 'Call Scheduled', 'Call Done', 'Proposal Sent', 'Won', 'Lost']
const PRIORITIES: LeadPriority[] = ['Hot', 'Warm', 'Cold']

function EditableDealValue({ leadId, value }: { leadId: string; value: number | null }) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(value?.toString() ?? '')
  const [isPending, startTransition] = useTransition()

  function save() {
    const num = input.trim() === '' ? null : parseFloat(input)
    if (!isNaN(num as number) || num === null) {
      startTransition(async () => {
        await updateLeadDealValue(leadId, num)
        setEditing(false)
      })
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-slate-500 text-sm">€</span>
        <input
          autoFocus
          type="number"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
          className="w-32 text-sm border border-blue-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
        <button onClick={save} disabled={isPending} className="p-1 text-emerald-600 hover:text-emerald-700">
          <Check size={15} />
        </button>
        <button onClick={() => setEditing(false)} className="p-1 text-slate-400 hover:text-slate-600">
          <X size={15} />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 group"
    >
      {value != null ? `€${value.toLocaleString()}` : <span className="text-slate-400 font-normal">Set value</span>}
      <Pencil size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

export default function LeadHeader({ lead }: { lead: Lead }) {
  const [isPending, startTransition] = useTransition()

  function handleStageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const stage = e.target.value as LeadStage
    startTransition(() => updateLeadStage(lead.id, stage))
  }

  function handlePriorityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const priority = e.target.value as LeadPriority
    startTransition(() => updateLeadPriority(lead.id, priority))
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${isPending ? 'opacity-70' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {lead.first_name} {lead.last_name}
          </h1>
          <p className="text-slate-500 mt-0.5">{lead.company}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority */}
          <div className="relative">
            <select
              defaultValue={lead.priority}
              onChange={handlePriorityChange}
              className="appearance-none pl-2 pr-6 py-1 text-xs font-medium rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
            >
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▾</span>
          </div>

          {/* Stage */}
          <select
            defaultValue={lead.stage}
            onChange={handleStageChange}
            className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 bg-white cursor-pointer"
          >
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Meta grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <MetaField label="Email" value={<a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a>} />
        <MetaField label="Phone" value={lead.phone ? <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">{lead.phone}</a> : <span className="text-slate-400">—</span>} />
        <MetaField label="Source" value={lead.source} />
        <MetaField label="Service" value={lead.service_type} />
        <MetaField
          label="Deal Value"
          value={<EditableDealValue leadId={lead.id} value={lead.deal_value} />}
        />
        {lead.lost_reason && (
          <MetaField label="Lost Reason" value={lead.lost_reason} className="col-span-2" />
        )}
      </div>
    </div>
  )
}

function MetaField({
  label,
  value,
  className = '',
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <div className="text-sm text-slate-700">{value}</div>
    </div>
  )
}
