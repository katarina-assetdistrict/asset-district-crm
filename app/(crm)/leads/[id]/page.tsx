import { getLead, getCallNotes, getActivityLog } from '@/lib/queries'
import LeadHeader from '@/components/lead-header'
import CallNotesForm from '@/components/call-notes-form'
import ActivityTimeline from '@/components/activity-timeline'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  let lead, callNotes, activityLog

  try {
    ;[lead, callNotes, activityLog] = await Promise.all([
      getLead(params.id),
      getCallNotes(params.id),
      getActivityLog(params.id),
    ])
  } catch {
    notFound()
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/pipeline"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ChevronLeft size={16} />
        Back to Pipeline
      </Link>

      {/* Lead header with inline editing */}
      <LeadHeader lead={lead} />

      {/* Bottom sections */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Call Notes — wider */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Call Notes</h2>
            <CallNotesForm leadId={lead.id} existingNotes={callNotes} />
          </div>
        </div>

        {/* Activity Log — narrower */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Activity Log</h2>
            <ActivityTimeline entries={activityLog} />
          </div>
        </div>
      </div>
    </div>
  )
}
