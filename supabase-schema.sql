-- 阿光作品集 CMS：資料表、RLS 與媒體儲存空間
-- 執行前請先確認管理員 Email。若不是 a26926291@gmail.com，請全文替換。

create table if not exists public.site_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "portfolio_public_read" on public.site_content;
create policy "portfolio_public_read"
on public.site_content
for select
to anon, authenticated
using (true);

drop policy if exists "portfolio_admin_insert" on public.site_content;
create policy "portfolio_admin_insert"
on public.site_content
for insert
to authenticated
with check ((select auth.jwt() ->> 'email') = 'a26926291@gmail.com');

drop policy if exists "portfolio_admin_update" on public.site_content;
create policy "portfolio_admin_update"
on public.site_content
for update
to authenticated
using ((select auth.jwt() ->> 'email') = 'a26926291@gmail.com')
with check ((select auth.jwt() ->> 'email') = 'a26926291@gmail.com');

drop policy if exists "portfolio_admin_delete" on public.site_content;
create policy "portfolio_admin_delete"
on public.site_content
for delete
to authenticated
using ((select auth.jwt() ->> 'email') = 'a26926291@gmail.com');

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "portfolio_media_public_read" on storage.objects;
create policy "portfolio_media_public_read"
on storage.objects
for select
to public
using (bucket_id = 'portfolio-media');

drop policy if exists "portfolio_media_admin_insert" on storage.objects;
create policy "portfolio_media_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-media'
  and (select auth.jwt() ->> 'email') = 'a26926291@gmail.com'
);

drop policy if exists "portfolio_media_admin_update" on storage.objects;
create policy "portfolio_media_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio-media'
  and (select auth.jwt() ->> 'email') = 'a26926291@gmail.com'
)
with check (
  bucket_id = 'portfolio-media'
  and (select auth.jwt() ->> 'email') = 'a26926291@gmail.com'
);

drop policy if exists "portfolio_media_admin_delete" on storage.objects;
create policy "portfolio_media_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portfolio-media'
  and (select auth.jwt() ->> 'email') = 'a26926291@gmail.com'
);
