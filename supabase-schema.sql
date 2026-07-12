-- Xiaxguang Portfolio CMS
-- Run this in Supabase SQL Editor.

create table if not exists public.site_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_content (id, content)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.site_content enable row level security;

drop policy if exists "Public can read portfolio content" on public.site_content;
create policy "Public can read portfolio content"
on public.site_content
for select
to anon, authenticated
using (true);

-- For a private admin workflow, replace this write policy with authenticated-user rules.
drop policy if exists "Authenticated can update portfolio content" on public.site_content;
create policy "Authenticated can update portfolio content"
on public.site_content
for all
to authenticated
using (true)
with check (true);

-- Create a public bucket named "portfolio-media" in Storage.
-- Recommended:
-- 1. Public read access for portfolio media.
-- 2. Upload/update/delete restricted to authenticated users.
