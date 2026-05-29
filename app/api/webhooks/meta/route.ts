import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

// ---------------------------------------------------------------
// GET — Meta webhook verification (hub.challenge handshake)
// ---------------------------------------------------------------
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams
  const mode      = p.get('hub.mode')
  const token     = p.get('hub.verify_token')
  const challenge = p.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

// ---------------------------------------------------------------
// POST — Receive new lead from Meta Lead Form ad
// ---------------------------------------------------------------
export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  if (!verifySignature(rawBody, request.headers.get('x-hub-signature-256'))) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  let payload: MetaWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new NextResponse('Bad Request', { status: 400 })
  }

  if (payload.object !== 'page') {
    return NextResponse.json({ status: 'ignored' })
  }

  const jobs: Promise<void>[] = []
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field === 'leadgen') {
        jobs.push(processMetaLead(change.value))
      }
    }
  }
  await Promise.allSettled(jobs)

  return NextResponse.json({ status: 'ok' })
}

// ---------------------------------------------------------------
// Signature verification
// ---------------------------------------------------------------
function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.META_APP_SECRET
  if (!secret) return false
  if (!signature) return false

  const expected =
    'sha256=' +
    crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

// ---------------------------------------------------------------
// Fetch lead fields from Meta Graph API and create in Supabase
// ---------------------------------------------------------------
async function processMetaLead(value: MetaLeadgenValue) {
  const { leadgen_id, form_id, page_id, ad_id, ad_name, adset_name, campaign_id, campaign_name } = value

  const accessToken = process.env.META_PAGE_ACCESS_TOKEN
  if (!accessToken) {
    console.error('[Meta webhook] META_PAGE_ACCESS_TOKEN not set')
    return
  }

  const graphRes = await fetch(
    `https://graph.facebook.com/v19.0/${leadgen_id}?fields=field_data,created_time&access_token=${accessToken}`
  )

  if (!graphRes.ok) {
    console.error('[Meta webhook] Graph API error:', await graphRes.text())
    return
  }

  const graphData = await graphRes.json() as MetaLeadData

  // Flatten field_data into a key→value map
  const fields: Record<string, string> = {}
  for (const f of graphData.field_data ?? []) {
    fields[f.name.toLowerCase()] = f.values?.[0] ?? ''
  }

  // Parse name — Meta can send full_name or first_name + last_name
  const fullName = (
    fields['full_name'] ||
    `${fields['first_name'] ?? ''} ${fields['last_name'] ?? ''}`.trim() ||
    'Unknown'
  )
  const spaceIdx = fullName.indexOf(' ')
  const firstName = spaceIdx > -1 ? fullName.slice(0, spaceIdx) : fullName
  const lastName  = spaceIdx > -1 ? fullName.slice(spaceIdx + 1) : ''

  const supabase = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: lead, error } = await (supabase.from('leads') as any)
    .insert({
      first_name:   firstName,
      last_name:    lastName || '-',
      company:      fields['company_name'] ?? fields['company'] ?? '-',
      email:        fields['email'] ?? '',
      phone:        fields['phone_number'] ?? fields['phone'] ?? null,
      source:       'Meta',
      stage:        'New',
      priority:     'Warm',
      service_type: 'Other',
      lost_reason:  null,
      meta_data: {
        leadgen_id,
        form_id,
        page_id,
        ad_id:         ad_id ?? null,
        ad_name:       ad_name ?? null,
        adset_name:    adset_name ?? null,
        campaign_id:   campaign_id ?? null,
        campaign_name: campaign_name ?? null,
        raw_fields:    fields,
        received_at:   new Date().toISOString(),
      },
    })
    .select()
    .single()

  if (error) {
    console.error('[Meta webhook] Failed to create lead:', error)
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('activity_log') as any).insert({
    lead_id:   lead.id,
    action:    `Lead received from Meta Ads${ad_name ? ` — ad: "${ad_name}"` : ''}${campaign_name ? ` / campaign: "${campaign_name}"` : ''}`,
    automated: true,
  })
}

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------
interface MetaWebhookPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      field: string
      value: MetaLeadgenValue
    }>
  }>
}

interface MetaLeadgenValue {
  leadgen_id:    string
  form_id:       string
  page_id:       string
  ad_id?:        string
  ad_name?:      string
  adset_id?:     string
  adset_name?:   string
  campaign_id?:  string
  campaign_name?: string
  created_time?: number
}

interface MetaLeadData {
  field_data: Array<{
    name:   string
    values: string[]
  }>
  created_time?: string
}
