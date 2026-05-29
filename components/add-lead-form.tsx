'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createLead } from '@/lib/actions'

const sources = ['Meta', 'Instagram', 'LinkedIn', 'Referral', 'Website', 'Other'] as const
const stages = ['New', 'Call Scheduled', 'Call Done', 'Proposal Sent', 'Won', 'Lost'] as const
const priorities = ['Hot', 'Warm', 'Cold'] as const
const services = ['Strategy Package', 'Consulting', 'Retainer', 'Other'] as const

function Field({
  label,
  children,
  required,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-300'

export default function AddLeadForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await createLead(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.id) {
        router.push(`/leads/${result.id}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact Info */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name" required>
            <input name="first_name" type="text" required placeholder="John" className={inputClass} />
          </Field>
          <Field label="Last Name" required>
            <input name="last_name" type="text" required placeholder="Smith" className={inputClass} />
          </Field>
          <Field label="Company" required>
            <input name="company" type="text" required placeholder="Acme Corp" className={inputClass} />
          </Field>
          <Field label="Email" required>
            <input name="email" type="email" required placeholder="john@acme.com" className={inputClass} />
          </Field>
          <Field label="Phone">
            <input name="phone" type="tel" placeholder="+1 234 567 890" className={inputClass} />
          </Field>
        </div>
      </section>

      {/* Deal Info */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Deal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Source" required>
            <select name="source" required className={inputClass}>
              {sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Stage" required>
            <select name="stage" defaultValue="New" className={inputClass}>
              {stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Priority" required>
            <select name="priority" defaultValue="Warm" className={inputClass}>
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Service Type" required>
            <select name="service_type" className={inputClass}>
              {services.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Deal Value (€)">
            <input
              name="deal_value"
              type="number"
              min="0"
              step="100"
              placeholder="10000"
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-navy-800 text-white text-sm font-semibold rounded-xl hover:bg-navy-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Creating…' : 'Create Lead'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
