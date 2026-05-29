-- ============================================================
-- Asset District CRM — Initial Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enums
create type lead_source as enum ('Meta', 'Instagram', 'LinkedIn', 'Referral', 'Website', 'Other');
create type lead_stage as enum ('New', 'Call Scheduled', 'Call Done', 'Proposal Sent', 'Won', 'Lost');
create type lead_priority as enum ('Hot', 'Warm', 'Cold');
create type service_type as enum ('Strategy Package', 'Consulting', 'Retainer', 'Other');

-- ============================================================
-- leads
-- ============================================================
create table leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  first_name  text not null,
  last_name   text not null,
  company     text not null,
  email       text not null,
  phone       text,

  source      lead_source not null default 'Other',
  stage       lead_stage  not null default 'New',
  priority    lead_priority not null default 'Warm',

  deal_value  numeric(12, 2),
  service_type service_type not null default 'Other',
  lost_reason text
);

-- ============================================================
-- call_notes
-- ============================================================
create table call_notes (
  id                 uuid primary key default gen_random_uuid(),
  lead_id            uuid not null references leads(id) on delete cascade,
  created_at         timestamptz not null default now(),

  problem            text not null default '',
  current_situation  text not null default '',
  budget             text not null default '',
  timeline           text not null default '',
  next_step          text not null default ''
);

create index call_notes_lead_id_idx on call_notes(lead_id);

-- ============================================================
-- activity_log
-- ============================================================
create table activity_log (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references leads(id) on delete cascade,
  created_at timestamptz not null default now(),

  action     text not null,
  automated  boolean not null default false
);

create index activity_log_lead_id_idx on activity_log(lead_id);
create index activity_log_created_at_idx on activity_log(created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table leads        enable row level security;
alter table call_notes   enable row level security;
alter table activity_log enable row level security;

-- Authenticated users can read/write all rows (single-tenant CRM)
create policy "Authenticated users have full access to leads"
  on leads for all to authenticated using (true) with check (true);

create policy "Authenticated users have full access to call_notes"
  on call_notes for all to authenticated using (true) with check (true);

create policy "Authenticated users have full access to activity_log"
  on activity_log for all to authenticated using (true) with check (true);

-- ============================================================
-- Auto-log stage changes via trigger
-- ============================================================
create or replace function log_lead_stage_change()
returns trigger language plpgsql as $$
begin
  if old.stage is distinct from new.stage then
    insert into activity_log (lead_id, action, automated)
    values (new.id, 'Stage changed from "' || old.stage || '" to "' || new.stage || '"', true);
  end if;
  return new;
end;
$$;

create trigger lead_stage_change_trigger
  after update on leads
  for each row execute function log_lead_stage_change();
