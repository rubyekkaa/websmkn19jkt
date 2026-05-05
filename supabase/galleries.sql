-- =================================================================
-- Galeri foto per area (Humas/DUDI, Kesiswaan, Sarpras)
-- Jalankan di Supabase SQL Editor
--
-- Sebelum jalankan: buat bucket storage "gallery-photos" (Public)
-- di https://supabase.com/dashboard/project/_/storage/buckets
-- =================================================================

create extension if not exists "pgcrypto";

-- 1) Koleksi galeri (mis. "Kunjungan Industri", "Lab", dst)
create table if not exists public.gallery_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text,
  description text,
  cover_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_collections_sort_idx
  on public.gallery_collections(sort_order);

-- 2) Foto-foto di tiap koleksi
create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.gallery_collections(id) on delete cascade,
  image_url text not null,
  caption text,
  taken_at date,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists gallery_photos_collection_idx
  on public.gallery_photos(collection_id, sort_order);

-- =================================================================
-- ROW LEVEL SECURITY
-- =================================================================
alter table public.gallery_collections enable row level security;
alter table public.gallery_photos enable row level security;

-- Public read
drop policy if exists "gallery_collections public read" on public.gallery_collections;
create policy "gallery_collections public read"
  on public.gallery_collections for select
  using (true);

drop policy if exists "gallery_photos public read" on public.gallery_photos;
create policy "gallery_photos public read"
  on public.gallery_photos for select
  using (true);

-- Authenticated (admin / editor) write — RLS dilengkapi dengan check role
-- di aplikasi (RoleGuard) tapi tabel ini boleh di-CRUD oleh user login mana pun
drop policy if exists "gallery_collections write" on public.gallery_collections;
create policy "gallery_collections write"
  on public.gallery_collections for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "gallery_photos write" on public.gallery_photos;
create policy "gallery_photos write"
  on public.gallery_photos for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- =================================================================
-- Storage bucket policies
-- Setelah membuat bucket "gallery-photos" (Public):
-- =================================================================

drop policy if exists "gallery-photos public read" on storage.objects;
create policy "gallery-photos public read"
  on storage.objects for select
  using (bucket_id = 'gallery-photos');

drop policy if exists "gallery-photos authenticated write" on storage.objects;
create policy "gallery-photos authenticated write"
  on storage.objects for insert
  with check (bucket_id = 'gallery-photos' and auth.uid() is not null);

drop policy if exists "gallery-photos authenticated update" on storage.objects;
create policy "gallery-photos authenticated update"
  on storage.objects for update
  using (bucket_id = 'gallery-photos' and auth.uid() is not null);

drop policy if exists "gallery-photos authenticated delete" on storage.objects;
create policy "gallery-photos authenticated delete"
  on storage.objects for delete
  using (bucket_id = 'gallery-photos' and auth.uid() is not null);

-- =================================================================
-- Seed 10 collection awal — slug HARUS sesuai dengan yang dipakai
-- oleh halaman publik (lihat src/pages/HumasDudiKunjungan.tsx, dll).
-- ON CONFLICT (slug) DO NOTHING supaya aman dijalankan ulang.
-- =================================================================
insert into public.gallery_collections (slug, name, category, description, sort_order) values
  ('kunjungan-industri',         'Kunjungan Industri',  'humas-dudi', 'Galeri kegiatan kunjungan ke perusahaan mitra industri.', 10),
  ('kelas-industri',             'Kelas Industri',      'humas-dudi', 'Galeri kegiatan kelas industri bersama mitra.',          20),
  ('kegiatan-rutin',             'Kegiatan Rutin',      'kesiswaan',  'Galeri kegiatan rutin sekolah.',                          30),
  ('sarpras-lab',                'Laboratorium',        'sarpras',    'Lab komputer & multimedia.',                              40),
  ('sarpras-kelas',              'Ruang Kelas',         'sarpras',    'Ruang kelas ber-AC dan smart board.',                     50),
  ('sarpras-studio',             'Studio',              'sarpras',    'Studio film & broadcasting.',                             60),
  ('sarpras-tefa-perfilman',     'TeFa Perfilman',      'sarpras',    'Teaching factory Produksi Film.',                         70),
  ('sarpras-tefa-perkantoran',   'TeFa Perkantoran',    'sarpras',    'Teaching factory MPLB.',                                  80),
  ('sarpras-tefa-bisnis-retail', 'TeFa Bisnis Retail',  'sarpras',    'Teaching factory Bisnis Retail.',                         90),
  ('sarpras-tefa-akuntansi',     'TeFa Akuntansi',      'sarpras',    'Teaching factory AKL.',                                  100)
on conflict (slug) do nothing;
