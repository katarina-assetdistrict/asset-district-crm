'use client'

import { useState, useTransition } from 'react'
import { addCallNote } from '@/lib/actions'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import type { CallNote } from '@/types/database'
import { formatDate } from '@/lib/utils'

const fields = [
  { name: 'problem', label: 'Problem', placeholder: 'What is the core problem they need solved?' },
  { name: 'current_situation', label: 'Current Situation', placeholder: 'Describe their current state...' },
  { name: 'budget', label: 'Budget', placeholder: 'e.g. €10,000–15,000 / "TBD"' },
  { name: 'timeline', label: 'Timeline', placeholder: 'e.g. Q3 2026, ASAP, within 3 months' },
  { name: 'next_step', label: 'Next Step', placeholder: 'What was agreed as the next action?' },
] as const

function NoteCard({ note }: { note: CallNote }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 text-left transition-colors"
      >
        <span className="text-sm font-medium text-slate-700">{formatDate(note.created_at)}</span>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 bg-white border-t border-slate-100 space-y-3">
          {[
            ['Problem', note.problem],
            ['Current Situation', note.current_situation],
            ['Budget', note.budget],
            ['Timeline', note.timeline],
            ['Next Step', note.next_step],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{value || '—'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CallNotesForm({
  leadId,
  existingNotes,
}: {
  leadId: string
  existingNotes: CallNote[]
}) {
  const [showForm, setShowForm] = useState(existingNotes.length === 0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const form = e.currentTarget
    setError(null)
    startTransition(async () => {
      try {
        await addCallNote(leadId, formData)
        form.reset()
        setShowForm(false)
      } catch {
        setError('Failed to save notes. Please try again.')
      }
    })
  }

  return (
    <div className="space-y-3">
      {existingNotes.map(note => (
        <NoteCard key={note.id} note={note} />
      ))}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus size={16} />
          Add call notes
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-slate-200 rounded-xl bg-white overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-700">New Call Notes</p>
          </div>
          <div className="p-4 space-y-4">
            {fields.map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {label}
                </label>
                <textarea
                  name={name}
                  placeholder={placeholder}
                  rows={2}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-slate-300"
                />
              </div>
            ))}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-navy-800 text-white text-sm font-medium rounded-lg hover:bg-navy-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? 'Saving…' : 'Save Notes'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
