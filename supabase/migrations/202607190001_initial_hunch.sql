create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_title text not null default 'Saved Hunch report',
  source_type text not null,
  original_text text not null check (char_length(original_text) >= 40),
  risk_score integer not null check (risk_score between 0 and 100),
  risk_level text not null check (risk_level in ('low-risk', 'caution', 'high-risk')),
  result_state text not null check (result_state in ('low-risk', 'caution', 'high-risk', 'partial-uncertain')),
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  summary text not null,
  uncertainty text not null,
  missing_information jsonb not null default '[]'::jsonb,
  score_breakdown jsonb not null default '[]'::jsonb,
  analysis_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.red_flags (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  rule_id text not null,
  category text not null,
  title text not null,
  severity text not null check (severity in ('medium', 'high')),
  explanation text not null,
  evidence text not null,
  score_impact integer not null,
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  next_action text not null,
  source text not null default 'rule' check (source in ('rule', 'ai-supported', 'user-confirmed'))
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  label text not null,
  reason text not null,
  completed boolean not null default false,
  related_category text,
  position integer not null default 0
);

create index if not exists analyses_user_created_at_idx on public.analyses(user_id, created_at desc);
create index if not exists red_flags_analysis_id_idx on public.red_flags(analysis_id);
create index if not exists checklist_items_analysis_id_idx on public.checklist_items(analysis_id);

alter table public.profiles enable row level security;
alter table public.analyses enable row level security;
alter table public.red_flags enable row level security;
alter table public.checklist_items enable row level security;

drop policy if exists "profiles are private" on public.profiles;
create policy "profiles are private" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "users manage their analyses" on public.analyses;
create policy "users manage their analyses" on public.analyses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users manage their red flags" on public.red_flags;
create policy "users manage their red flags" on public.red_flags for all using (exists (select 1 from public.analyses as a where a.id = red_flags.analysis_id and a.user_id = auth.uid())) with check (exists (select 1 from public.analyses as a where a.id = red_flags.analysis_id and a.user_id = auth.uid()));

drop policy if exists "users manage their checklist items" on public.checklist_items;
create policy "users manage their checklist items" on public.checklist_items for all using (exists (select 1 from public.analyses as a where a.id = checklist_items.analysis_id and a.user_id = auth.uid())) with check (exists (select 1 from public.analyses as a where a.id = checklist_items.analysis_id and a.user_id = auth.uid()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
