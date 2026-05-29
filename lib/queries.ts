import { createClient } from '@/lib/supabase/server'
import type { Lead, CallNote, ActivityLog } from '@/types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any

export async function getLeadsWithStageDate() {
  const supabase: AnyClient = await createClient()

  const [leadsRes, changesRes] = await Promise.all([
    supabase.from('leads').select('*').order('created_at', { ascending: false }),
    supabase
      .from('activity_log')
      .select('lead_id, created_at')
      .ilike('action', 'Stage changed%')
      .order('created_at', { ascending: false }),
  ])

  if (leadsRes.error) throw leadsRes.error

  const latestChange = new Map<string, string>()
  for (const row of (changesRes.data ?? []) as { lead_id: string; created_at: string }[]) {
    if (!latestChange.has(row.lead_id)) latestChange.set(row.lead_id, row.created_at)
  }

  return (leadsRes.data as Lead[]).map((lead: Lead) => ({
    ...lead,
    stage_changed_at: latestChange.get(lead.id) ?? lead.created_at,
  }))
}

export async function getLead(id: string) {
  const supabase: AnyClient = await createClient()
  const { data, error } = await supabase.from('leads').select('*').eq('id', id).single()
  if (error) throw error
  return data as Lead
}

export async function getCallNotes(leadId: string) {
  const supabase: AnyClient = await createClient()
  const { data, error } = await supabase
    .from('call_notes')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as CallNote[]
}

export async function getActivityLog(leadId: string) {
  const supabase: AnyClient = await createClient()
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as ActivityLog[]
}

export async function getRecentActivity() {
  const supabase: AnyClient = await createClient()
  const { data, error } = await supabase
    .from('activity_log')
    .select('*, leads(first_name, last_name, company)')
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) throw error
  return data as (ActivityLog & { leads: Pick<Lead, 'first_name' | 'last_name' | 'company'> | null })[]
}

export async function getDashboardStats() {
  const supabase: AnyClient = await createClient()
  const { data, error } = await supabase.from('leads').select('stage, deal_value, priority')
  if (error) throw error
  const rows = data as Pick<Lead, 'stage' | 'deal_value' | 'priority'>[]

  const stages = ['New', 'Call Scheduled', 'Call Done', 'Proposal Sent', 'Won', 'Lost'] as const
  const stageStats = stages.map(stage => ({
    stage,
    count: rows.filter(l => l.stage === stage).length,
    total: rows.filter(l => l.stage === stage).reduce((s, l) => s + (Number(l.deal_value) || 0), 0),
  }))

  return {
    stages: stageStats,
    hotLeads: rows.filter(l => l.priority === 'Hot').length,
    totalValue: rows.reduce((s, l) => s + (Number(l.deal_value) || 0), 0),
    wonValue: rows.filter(l => l.stage === 'Won').reduce((s, l) => s + (Number(l.deal_value) || 0), 0),
  }
}
