-- SponFy Database Schema Migration
-- Complete PostgreSQL schema with Row Level Security (RLS) enabled on EVERY table.

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  organization TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  daily_send_limit INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- 2. Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  audience_size INT NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  preferred_industries TEXT[] NOT NULL DEFAULT '{}',
  tiers JSONB NOT NULL DEFAULT '[]',
  deck_url TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own campaigns" ON public.campaigns FOR ALL USING (auth.uid() = user_id);

-- 3. Companies Table (Sponsors in pipeline)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT,
  stage TEXT NOT NULL DEFAULT 'Discovered',
  fit_score INT NOT NULL DEFAULT 0,
  score_breakdown JSONB NOT NULL DEFAULT '[]',
  pipeline_value NUMERIC NOT NULL DEFAULT 0,
  signals JSONB NOT NULL DEFAULT '[]',
  confidence NUMERIC NOT NULL DEFAULT 0.0,
  research_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own companies" ON public.companies FOR ALL USING (auth.uid() = user_id);

-- 4. Research Reports Table
CREATE TABLE IF NOT EXISTS public.research_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  sections JSONB NOT NULL DEFAULT '{}',
  recommended_angle TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.research_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own research reports" ON public.research_reports FOR ALL USING (auth.uid() = user_id);

-- 5. Sources Table (Cited URLs)
CREATE TABLE IF NOT EXISTS public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  snippet TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sources" ON public.sources FOR ALL USING (auth.uid() = user_id);

-- 6. Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'needs_verification', -- verified, public, needs_verification, unknown
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own contacts" ON public.contacts FOR ALL USING (auth.uid() = user_id);

-- 7. Email Drafts Table
CREATE TABLE IF NOT EXISTS public.email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  quality JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft', -- draft, approved, sent, failed
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own email drafts" ON public.email_drafts FOR ALL USING (auth.uid() = user_id);

-- 8. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  draft_id UUID REFERENCES public.email_drafts(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  gmail_message_id TEXT,
  gmail_thread_id TEXT,
  direction TEXT NOT NULL DEFAULT 'outbound', -- outbound, inbound
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own messages" ON public.messages FOR ALL USING (auth.uid() = user_id);

-- 9. Reply Analyses Table
CREATE TABLE IF NOT EXISTS public.reply_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  intent TEXT NOT NULL, -- Interested, Positive, Needs Info, Negotiating, Not Interested, Maybe Later, Out of Office, Unclear
  sentiment TEXT NOT NULL, -- positive, neutral, negative
  confidence NUMERIC NOT NULL DEFAULT 0.0,
  summary TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  requested_info TEXT[] NOT NULL DEFAULT '{}',
  next_action TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'medium', -- high, medium, low
  meeting_requested BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.reply_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reply analyses" ON public.reply_analyses FOR ALL USING (auth.uid() = user_id);

-- 10. Followup Sequences Table
CREATE TABLE IF NOT EXISTS public.followup_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[{"step": 1, "wait_days": 4}, {"step": 2, "wait_days": 7}]',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.followup_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sequences" ON public.followup_sequences FOR ALL USING (auth.uid() = user_id);

-- 11. Followup Tasks Table
CREATE TABLE IF NOT EXISTS public.followup_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES public.followup_sequences(id) ON DELETE SET NULL,
  step_number INT NOT NULL DEFAULT 1,
  due_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, skipped, cancelled
  ai_recommendation JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.followup_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own followup tasks" ON public.followup_tasks FOR ALL USING (auth.uid() = user_id);

-- 12. Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own activities" ON public.activities FOR ALL USING (auth.uid() = user_id);

-- 13. AI Jobs Table (streaming & background state)
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued', -- queued, processing, completed, failed
  step TEXT NOT NULL DEFAULT 'initializing',
  progress INT NOT NULL DEFAULT 0,
  error TEXT,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own ai jobs" ON public.ai_jobs FOR ALL USING (auth.uid() = user_id);

-- 14. Gmail Accounts Table
CREATE TABLE IF NOT EXISTS public.gmail_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  encrypted_tokens TEXT NOT NULL,
  is_connected BOOLEAN NOT NULL DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.gmail_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own gmail account" ON public.gmail_accounts FOR ALL USING (auth.uid() = user_id);

-- 15. Suppressions Table (Do Not Contact List)
CREATE TABLE IF NOT EXISTS public.suppressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  domain TEXT,
  reason TEXT NOT NULL DEFAULT 'manual', -- unsubscribed, bounced, not_interested, manual
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.suppressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own suppressions" ON public.suppressions FOR ALL USING (auth.uid() = user_id);

-- 16. Insights Table
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'recommendation',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own insights" ON public.insights FOR ALL USING (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_companies_campaign_id ON public.companies(campaign_id);
CREATE INDEX IF NOT EXISTS idx_companies_stage ON public.companies(stage);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_drafts_company_id ON public.email_drafts(company_id);
CREATE INDEX IF NOT EXISTS idx_messages_company_id ON public.messages(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_campaign_id ON public.activities(campaign_id);
CREATE INDEX IF NOT EXISTS idx_followup_tasks_due ON public.followup_tasks(due_at, status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user ON public.ai_jobs(user_id, status);
