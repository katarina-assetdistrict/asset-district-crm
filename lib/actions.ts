'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { LeadSource, LeadStage, LeadPriority, ServiceType } from '@/types/database'

export async function createLead(
  formData: FormData
): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('leads') as any)
    .insert({
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      company: formData.get('company') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || null,
      source: formData.get('source') as LeadSource,
      stage: (formData.get('stage') as LeadStage) || 'New',
      priority: formData.get('priority') as LeadPriority,
      deal_value: formData.get('deal_value') ? parseFloat(formData.get('deal_value') as string) : null,
      service_type: formData.get('service_type') as ServiceType,
      lost_reason: null,
    })
    .select()
    .single()

  if (error) return { error: (error as { message: string }).message }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('activity_log') as any).insert({
    lead_id: (data as { id: string }).id,
    action: 'Lead created',
    automated: true,
  })

  revalidatePath('/dashboard')
  revalidatePath('/pipeline')
  return { id: (data as { id: string }).id }
}

export async function updateLeadStage(leadId: string, stage: LeadStage, lostReason?: string) {
  const supabase = await createClient()
  const update: Record<string, unknown> = { stage }
  if (lostReason !== undefined) update.lost_reason = lostReason

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('leads') as any).update(update).eq('id', leadId)
  if (error) throw error
  // DB trigger logs the stage change automatically

  revalidatePath('/dashboard')
  revalidatePath('/pipeline')
  revalidatePath(`/leads/${leadId}`)
}

export async function updateLeadPriority(leadId: string, priority: LeadPriority) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('leads') as any).update({ priority }).eq('id', leadId)
  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('activity_log') as any).insert({
    lead_id: leadId,
    action: `Priority changed to ${priority}`,
    automated: true,
  })

  revalidatePath('/dashboard')
  revalidatePath('/pipeline')
  revalidatePath(`/leads/${leadId}`)
}

export async function updateLeadDealValue(leadId: string, dealValue: number | null) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('leads') as any).update({ deal_value: dealValue }).eq('id', leadId)
  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('activity_log') as any).insert({
    lead_id: leadId,
    action: `Deal value updated to ${dealValue != null ? `€${dealValue.toLocaleString()}` : 'N/A'}`,
    automated: true,
  })

  revalidatePath('/dashboard')
  revalidatePath('/pipeline')
  revalidatePath(`/leads/${leadId}`)
}

export async function addCallNote(leadId: string, formData: FormData) {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('call_notes') as any).insert({
    lead_id: leadId,
    problem: formData.get('problem') as string,
    current_situation: formData.get('current_situation') as string,
    budget: formData.get('budget') as string,
    timeline: formData.get('timeline') as string,
    next_step: formData.get('next_step') as string,
  })
  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('activity_log') as any).insert({
    lead_id: leadId,
    action: 'Call notes saved',
    automated: false,
  })

  revalidatePath(`/leads/${leadId}`)
}

export async function signIn(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
