alter table public.analyses
  add column if not exists explanation_source text not null default 'rules'
    check (explanation_source in ('rules', 'openai', 'rule-only-fallback'));

alter table public.analyses
  add column if not exists explanation_note text;

alter table public.analyses
  add column if not exists student_advice text not null default 'Verify the opportunity through an official company or school channel before applying.';
