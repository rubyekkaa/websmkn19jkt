-- =================================================================
-- PR C: MoU partners + Agenda akademik
-- Jalankan di Supabase SQL Editor.
--
-- Sebelum jalankan: buat bucket storage "mou-files" (Public)
-- di https://supabase.com/dashboard/project/_/storage/buckets
-- Bucket ini menyimpan logo mitra + dokumen PDF MoU.
-- =================================================================

create extension if not exists "pgcrypto";

-- =================================================================
-- 1) Tabel mou_partners — daftar mitra DUDI yang punya MoU
-- =================================================================
create table if not exists public.mou_partners (
  id uuid primary key default gen_random_uuid(),
  partner_name text not null,
  partner_logo_url text,
  description text,
  signed_at date not null,
  expires_at date,
  document_url text,
  status text check (status in ('aktif', 'berakhir')) default 'aktif',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mou_partners_signed_idx
  on public.mou_partners(signed_at desc);

create index if not exists mou_partners_status_idx
  on public.mou_partners(status);

-- =================================================================
-- 2) Tabel agenda_events — kalender akademik
-- =================================================================
create table if not exists public.agenda_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_at date not null,
  end_at date,
  location text,
  category text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agenda_events_start_idx
  on public.agenda_events(start_at);

-- =================================================================
-- ROW LEVEL SECURITY
-- =================================================================
alter table public.mou_partners enable row level security;
alter table public.agenda_events enable row level security;

-- Public read
drop policy if exists "mou_partners public read" on public.mou_partners;
create policy "mou_partners public read"
  on public.mou_partners for select
  using (true);

drop policy if exists "agenda_events public read" on public.agenda_events;
create policy "agenda_events public read"
  on public.agenda_events for select
  using (true);

-- Authenticated (admin / editor) write — RoleGuard di FE adalah lapis
-- tambahan; tabel boleh di-CRUD oleh user login mana pun.
drop policy if exists "mou_partners write" on public.mou_partners;
create policy "mou_partners write"
  on public.mou_partners for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "agenda_events write" on public.agenda_events;
create policy "agenda_events write"
  on public.agenda_events for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- =================================================================
-- Storage bucket policies (jalankan setelah bucket "mou-files" Public dibuat)
-- =================================================================
drop policy if exists "mou-files public read" on storage.objects;
create policy "mou-files public read"
  on storage.objects for select
  using (bucket_id = 'mou-files');

drop policy if exists "mou-files authenticated write" on storage.objects;
create policy "mou-files authenticated write"
  on storage.objects for insert
  with check (bucket_id = 'mou-files' and auth.uid() is not null);

drop policy if exists "mou-files authenticated update" on storage.objects;
create policy "mou-files authenticated update"
  on storage.objects for update
  using (bucket_id = 'mou-files' and auth.uid() is not null);

drop policy if exists "mou-files authenticated delete" on storage.objects;
create policy "mou-files authenticated delete"
  on storage.objects for delete
  using (bucket_id = 'mou-files' and auth.uid() is not null);

-- =================================================================
-- Tambahan koleksi galeri: Prestasi siswa (Kesiswaan).
-- Aman dijalankan walau tabel gallery_collections sudah ada / sudah berisi
-- data, karena pakai ON CONFLICT (slug) DO NOTHING.
-- =================================================================
insert into public.gallery_collections (slug, name, category, description, sort_order) values
  ('prestasi', 'Prestasi Siswa', 'kesiswaan', 'Galeri kejuaraan akademik, lomba bidang keahlian, ekstrakurikuler, dan capaian siswa lainnya.', 35)
on conflict (slug) do nothing;
