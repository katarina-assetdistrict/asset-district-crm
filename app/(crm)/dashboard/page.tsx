import { getDashboardStats, getRecentActivity, getLeadsWithStageDate } from '@/lib/queries'
import { formatCurrency, formatDistanceToNow } from '@/lib/utils'
import Link from 'next/link'
import PriorityBadge from '@/components/priority-badge'
import StageBadge from '@/components/stage-badge'
import type { LeadStage } from '@/types/database'
import { TrendingUp, Users, Star, Trophy } from 'lucide-react'

const stageColors: Record<LeadStage, string> = {
  'New':            'border-l-slate-400',
  'Call Scheduled': 'border-l-blue-400',
  'Call Done':      'border-l-indigo-400',
  'Proposal Sent':  'border-l-purple-400',
  'Won':            'border-l-emerald-400',
  'Lost':           'border-l-red-400',
}

export default async function DashboardPage() {
  const [{ stages, hotLeads, totalValue, wonValue }, activity, leads] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getLeadsWithStageDate(),
  ])

  const activeLeads = leads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost')
  const hotActiveLeads = activeLeads.filter(l => l.priority === 'Hot').slice(0, 6)

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Asset District CRM overview</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<Users size={18} />} label="Active Leads" value={activeLeads.length.toString()} color="blue" />
        <KPICard icon={<Star size={18} />} label="Hot Leads" value={hotLeads.toString()} color="red" />
        <KPICard icon={<TrendingUp size={18} />} label="Pipeline Value" value={formatCurrency(totalValue)} color="purple" />
        <KPICard icon={<Trophy size={18} />} label="Won Value" value={formatCurrency(wonValue)} color="green" />
      </div>

      {/* Stage breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Pipeline by Stage</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {stages.map(({ stage, count, total }) => (
            <Link
              key={stage}
              href="/pipeline"
              className={`bg-white rounded-xl border-l-4 border border-slate-200 p-4 hover:shadow-md transition-shadow ${stageColors[stage as LeadStage]}`}
            >
              <p className="text-xs font-semibold text-slate-500 truncate">{stage}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{count}</p>
              <p className="text-xs text-slate-400 mt-0.5">{total > 0 ? formatCurrency(total) : 'No value'}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hot leads */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Hot Leads</h2>
          {hotActiveLeads.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
              No hot leads right now
            </div>
          ) : (
            <div className="space-y-2">
              {hotActiveLeads.map(lead => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 px-4 py-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {lead.first_name} {lead.last_name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{lead.company}</p>
                  </div>
                  <StageBadge stage={lead.stage} />
                  <PriorityBadge priority={lead.priority} />
                  {lead.deal_value && (
                    <span className="text-sm font-semibold text-slate-700 shrink-0">
                      {formatCurrency(lead.deal_value)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Recent Activity</h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {(activity ?? []).slice(0, 10).map((entry) => (
              <div key={entry.id} className="px-4 py-3">
                <p className="text-xs font-medium text-slate-600 truncate">
                  {entry.leads?.first_name} {entry.leads?.last_name}
                  {entry.leads?.company && (
                    <span className="text-slate-400 font-normal"> · {entry.leads.company}</span>
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{entry.action}</p>
                <p className="text-xs text-slate-300 mt-0.5">{formatDistanceToNow(entry.created_at)}</p>
              </div>
            ))}
            {(activity ?? []).length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-400">No activity yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: 'blue' | 'red' | 'purple' | 'green'
}) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    red:    'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    green:  'bg-emerald-50 text-emerald-600',
  }
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900 truncate">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}
