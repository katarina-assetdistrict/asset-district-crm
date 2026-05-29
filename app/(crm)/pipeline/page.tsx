import { getLeadsWithStageDate } from '@/lib/queries'
import KanbanBoard from '@/components/kanban-board'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function PipelinePage() {
  const leads = await getLeadsWithStageDate()

  return (
    <div className="flex flex-col h-full p-6 lg:p-8 gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
          <p className="text-slate-500 text-sm mt-0.5">{leads.length} total leads</p>
        </div>
        <Link
          href="/leads/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy-800 text-white text-sm font-semibold rounded-xl hover:bg-navy-700 transition-colors"
        >
          <Plus size={16} />
          Add Lead
        </Link>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard leads={leads} />
      </div>
    </div>
  )
}
