-- =================================================================
-- Skema database SMKN 19 Jakarta — jalankan di Supabase SQL Editor
-- =================================================================

-- Pastikan extension uuid_generate_v4/gen_random_uuid tersedia
create extension if not exists "pgcrypto";

-- 1) Kategori berita
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- 2) Tag
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- 3) Berita (posts)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  cover_url text,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx
  on public.posts(status, published_at desc);

-- 4) Many-to-many post <-> tag
create table if not exists public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id  uuid not null references public.tags(id)  on delete cascade,
  primary key (post_id, tag_id)
);

-- 5) Pesan dari form kontak
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- =================================================================
-- ROW LEVEL SECURITY
-- =================================================================
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;
alter table public.contact_messages enable row level security;

-- categories: publik bisa read, hanya user login (admin) yang boleh CRUD
drop policy if exists "categories read" on public.categories;
create policy "categories read"
  on public.categories for select
  using (true);

drop policy if exists "categories write" on public.categories;
create policy "categories write"
  on public.categories for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- tags: sama dengan categories
drop policy if exists "tags read" on public.tags;
create policy "tags read"
  on public.tags for select
  using (true);

drop policy if exists "tags write" on public.tags;
create policy "tags write"
  on public.tags for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- posts: publik hanya bisa baca yang status='published'; user login bisa CRUD
drop policy if exists "posts public read" on public.posts;
create policy "posts public read"
  on public.posts for select
  using (status = 'published' or auth.uid() is not null);

drop policy if exists "posts admin write" on public.posts;
create policy "posts admin write"
  on public.posts for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- post_tags: publik read; admin write
drop policy if exists "post_tags read" on public.post_tags;
create policy "post_tags read"
  on public.post_tags for select
  using (true);

drop policy if exists "post_tags write" on public.post_tags;
create policy "post_tags write"
  on public.post_tags for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- contact_messages: publik bisa INSERT (kirim pesan); hanya admin bisa SELECT/DELETE
drop policy if exists "contact insert public" on public.contact_messages;
create policy "contact insert public"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "contact admin read" on public.contact_messages;
create policy "contact admin read"
  on public.contact_messages for select
  using (auth.uid() is not null);

drop policy if exists "contact admin delete" on public.contact_messages;
create policy "contact admin delete"
  on public.contact_messages for delete
  using (auth.uid() is not null);

-- =================================================================
-- Storage bucket untuk gambar cover berita
-- Jalankan di Supabase Dashboard -> Storage:
--   1. Buat bucket bernama "post-images"
--   2. Centang "Public bucket" supaya gambarnya bisa diakses publik
--   3. Lalu jalankan policy berikut di SQL Editor (untuk upload oleh user login):
-- =================================================================

-- Policy storage: hanya user login yang boleh upload/update/delete gambar di bucket post-images
drop policy if exists "post-images public read" on storage.objects;
create policy "post-images public read"
  on storage.objects for select
  using (bucket_id = 'post-images');

drop policy if exists "post-images authenticated write" on storage.objects;
create policy "post-images authenticated write"
  on storage.objects for insert
  with check (bucket_id = 'post-images' and auth.uid() is not null);

drop policy if exists "post-images authenticated update" on storage.objects;
create policy "post-images authenticated update"
  on storage.objects for update
  using (bucket_id = 'post-images' and auth.uid() is not null);

drop policy if exists "post-images authenticated delete" on storage.objects;
create policy "post-images authenticated delete"
  on storage.objects for delete
  using (bucket_id = 'post-images' and auth.uid() is not null);

-- =================================================================
-- Seed data awal (opsional)
-- =================================================================
insert into public.categories (name, slug) values
  ('Pengumuman', 'pengumuman'),
  ('Prestasi', 'prestasi'),
  ('Kegiatan', 'kegiatan'),
  ('Akademik', 'akademik')
on conflict (slug) do nothing;

insert into public.tags (name, slug) values
  ('Lomba', 'lomba'),
  ('Kunjungan Industri', 'kunjungan-industri'),
  ('Upacara', 'upacara'),
  ('Ekstrakurikuler', 'ekstrakurikuler')
on conflict (slug) do nothing;
