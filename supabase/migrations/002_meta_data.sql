-- ============================================================
-- Migration 002 — Meta Ads webhook support
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add meta_data column to store Meta Ads lead form details
alter table leads add column if not exists meta_data jsonb;
