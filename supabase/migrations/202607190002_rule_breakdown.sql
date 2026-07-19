alter table if exists public.analyses add column if not exists score_breakdown jsonb not null default '[]'::jsonb;
alter table if exists public.red_flags add column if not exists rule_id text;
alter table if exists public.red_flags add column if not exists source text not null default 'rule';
update public.red_flags set rule_id = coalesce(rule_id, category) where rule_id is null;
alter table if exists public.red_flags alter column rule_id set not null;
alter table if exists public.red_flags drop constraint if exists red_flags_source_check;
alter table if exists public.red_flags add constraint red_flags_source_check check (source in ('rule', 'ai-supported', 'user-confirmed'));
