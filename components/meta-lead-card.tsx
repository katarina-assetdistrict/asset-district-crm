import type { MetaLeadData } from '@/types/database'
import { formatDate } from '@/lib/utils'

export default function MetaLeadCard({ meta }: { meta: MetaLeadData }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-2.5 mb-4">
        {/* Meta "M" wordmark in brand blue */}
        <div className="w-7 h-7 rounded-md bg-[#1877F2] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Meta Ads Lead</p>
          {meta.received_at && (
            <p className="text-xs text-slate-400">{formatDate(meta.received_at)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {meta.campaign_name && (
          <MetaField label="Campaign" value={meta.campaign_name} />
        )}
        {meta.ad_name && (
          <MetaField label="Ad" value={meta.ad_name} />
        )}
        {meta.adset_name && (
          <MetaField label="Ad Set" value={meta.adset_name} />
        )}
        {meta.form_id && (
          <MetaField label="Form ID" value={meta.form_id} mono />
        )}
        {meta.leadgen_id && (
          <MetaField label="Lead ID" value={meta.leadgen_id} mono />
        )}
        {meta.ad_id && (
          <MetaField label="Ad ID" value={meta.ad_id} mono />
        )}
      </div>

      {meta.raw_fields && Object.keys(meta.raw_fields).length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Form Fields</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(meta.raw_fields).map(([key, value]) => (
              <div key={key} className="bg-slate-50 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-400 capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm text-slate-700 truncate">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MetaField({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm text-slate-700 truncate ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  )
}
