export type LeadSource = 'Meta' | 'Instagram' | 'LinkedIn' | 'Referral' | 'Website' | 'Other'
export type LeadStage = 'New' | 'Call Scheduled' | 'Call Done' | 'Proposal Sent' | 'Won' | 'Lost'
export type LeadPriority = 'Hot' | 'Warm' | 'Cold'
export type ServiceType = 'Strategy Package' | 'Consulting' | 'Retainer' | 'Other'

export interface Lead {
  id: string
  created_at: string
  first_name: string
  last_name: string
  company: string
  email: string
  phone: string | null
  source: LeadSource
  stage: LeadStage
  priority: LeadPriority
  deal_value: number | null
  service_type: ServiceType
  lost_reason: string | null
}

export interface CallNote {
  id: string
  lead_id: string
  created_at: string
  problem: string
  current_situation: string
  budget: string
  timeline: string
  next_step: string
}

export interface ActivityLog {
  id: string
  lead_id: string
  created_at: string
  action: string
  automated: boolean
}

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: Lead
        Insert: Omit<Lead, 'id' | 'created_at'>
        Update: Partial<Omit<Lead, 'id' | 'created_at'>>
        Relationships: []
      }
      call_notes: {
        Row: CallNote
        Insert: Omit<CallNote, 'id' | 'created_at'>
        Update: Partial<Omit<CallNote, 'id' | 'created_at'>>
        Relationships: []
      }
      activity_log: {
        Row: ActivityLog
        Insert: Omit<ActivityLog, 'id' | 'created_at'>
        Update: Partial<Omit<ActivityLog, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
