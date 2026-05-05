-- =================================================================
-- Ekskul + Jurusan CMS
-- Jalankan di Supabase SQL Editor.
--
-- Sebelum jalankan:
--   1. Buat bucket storage "ekskul-photos" (Public)
--   2. Buat bucket storage "jurusan-photos" (Public)
--   di https://supabase.com/dashboard/project/_/storage/buckets
-- =================================================================

create extension if not exists "pgcrypto";

-- =================================================================
-- 1) Tabel ekskul — kegiatan ekstrakurikuler
-- =================================================================
create table if not exists public.ekskul (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  schedule text,
  pembina text,
  category text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ekskul_sort_idx
  on public.ekskul(sort_order, name);

-- =================================================================
-- 2) Tabel jurusan — program keahlian
-- =================================================================
create table if not exists public.jurusan (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text,
  description text,
  image_url text,
  competencies text[] not null default '{}',
  career_paths text[] not null default '{}',
  duration text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jurusan_sort_idx
  on public.jurusan(sort_order, name);

-- =================================================================
-- ROW LEVEL SECURITY
-- =================================================================
alter table public.ekskul enable row level security;
alter table public.jurusan enable row level security;

-- Public read
drop policy if exists "ekskul public read" on public.ekskul;
create policy "ekskul public read"
  on public.ekskul for select
  using (true);

drop policy if exists "jurusan public read" on public.jurusan;
create policy "jurusan public read"
  on public.jurusan for select
  using (true);

-- Authenticated (admin / editor) write — RoleGuard di FE adalah lapis tambahan
drop policy if exists "ekskul write" on public.ekskul;
create policy "ekskul write"
  on public.ekskul for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "jurusan write" on public.jurusan;
create policy "jurusan write"
  on public.jurusan for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- =================================================================
-- Storage bucket policies (jalankan setelah bucket "ekskul-photos" &
-- "jurusan-photos" Public dibuat)
-- =================================================================
drop policy if exists "ekskul-photos public read" on storage.objects;
create policy "ekskul-photos public read"
  on storage.objects for select
  using (bucket_id = 'ekskul-photos');

drop policy if exists "ekskul-photos authenticated write" on storage.objects;
create policy "ekskul-photos authenticated write"
  on storage.objects for insert
  with check (bucket_id = 'ekskul-photos' and auth.uid() is not null);

drop policy if exists "ekskul-photos authenticated update" on storage.objects;
create policy "ekskul-photos authenticated update"
  on storage.objects for update
  using (bucket_id = 'ekskul-photos' and auth.uid() is not null);

drop policy if exists "ekskul-photos authenticated delete" on storage.objects;
create policy "ekskul-photos authenticated delete"
  on storage.objects for delete
  using (bucket_id = 'ekskul-photos' and auth.uid() is not null);

drop policy if exists "jurusan-photos public read" on storage.objects;
create policy "jurusan-photos public read"
  on storage.objects for select
  using (bucket_id = 'jurusan-photos');

drop policy if exists "jurusan-photos authenticated write" on storage.objects;
create policy "jurusan-photos authenticated write"
  on storage.objects for insert
  with check (bucket_id = 'jurusan-photos' and auth.uid() is not null);

drop policy if exists "jurusan-photos authenticated update" on storage.objects;
create policy "jurusan-photos authenticated update"
  on storage.objects for update
  using (bucket_id = 'jurusan-photos' and auth.uid() is not null);

drop policy if exists "jurusan-photos authenticated delete" on storage.objects;
create policy "jurusan-photos authenticated delete"
  on storage.objects for delete
  using (bucket_id = 'jurusan-photos' and auth.uid() is not null);

-- =================================================================
-- Seed data — 8 ekskul + 4 jurusan existing dari hardcoded data lama.
-- Idempotent: ON CONFLICT (slug) DO NOTHING — aman dijalankan ulang
-- tanpa nimpa data admin yang sudah ada.
-- =================================================================
insert into public.ekskul (slug, name, description, image_url, sort_order) values
  ('paskibra',     'Paskibra',                    'Pembinaan kedisiplinan, kepemimpinan, dan keterampilan baris-berbaris.',  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=70', 10),
  ('pramuka',      'Pramuka',                     'Kemandirian, tanggung jawab, dan keterampilan kepramukaan.',              'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=70', 20),
  ('pmr',          'PMR (Palang Merah Remaja)',   'Pelatihan pertolongan pertama dan aksi sosial kemanusiaan.',              'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=70', 30),
  ('kir',          'KIR (Karya Ilmiah Remaja)',   'Wadah meneliti dan menghasilkan karya ilmiah bagi siswa.',                'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=70', 40),
  ('futsal',       'Futsal',                      'Olahraga tim, sportivitas, dan kompetisi antar sekolah.',                 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=70', 50),
  ('basket',       'Basket',                      'Fundamental basket dan pengembangan fisik.',                              'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=70', 60),
  ('rohis',        'Rohani Islam',                'Wadah pembinaan keagamaan dan pengembangan akhlak mulia.',                'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1200&q=70', 70),
  ('english-club', 'English Club',                'Mengasah kemampuan bahasa Inggris lewat diskusi, debat, dan pidato.',     'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=70', 80)
on conflict (slug) do nothing;

insert into public.jurusan (slug, name, short_name, description, image_url, competencies, sort_order) values
  ('produksi-film', 'Produksi Film',                                    'Sinematografi & Film',
   'Kompetensi keahlian yang fokus pada penulisan naskah, sinematografi, penyutradaraan, editing, hingga pascaproduksi karya film & video pendek.',
   'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=70',
   array['Penulisan Naskah','Sinematografi','Penyutradaraan','Editing & Pascaproduksi','Produksi Konten Digital'],
   10),
  ('akl', 'Akuntansi Keuangan & Lembaga (AKL)',                        'Akuntansi & Keuangan',
   'Membekali siswa dengan kompetensi akuntansi, perpajakan, audit, dan penggunaan software akuntansi modern untuk industri & UMKM.',
   'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=70',
   array['Dasar Akuntansi','Perpajakan','Komputer Akuntansi (MYOB / Accurate)','Audit & Pelaporan','Spreadsheet Keuangan'],
   20),
  ('mplb', 'Manajemen Perkantoran & Layanan Bisnis (MPLB)',            'Administrasi Modern',
   'Mengasah kompetensi administrasi modern: pengelolaan dokumen digital, layanan pelanggan, korespondensi bisnis, dan komunikasi profesional.',
   'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1200&q=70',
   array['Administrasi Umum','Korespondensi & Kearsipan Digital','Customer Service','Otomatisasi Perkantoran','Komunikasi Bisnis'],
   30),
  ('bisnis-retail', 'Bisnis Retail',                                    'Retail & Kewirausahaan',
   'Membekali siswa dengan keahlian operasional toko, merchandising, pemasaran, layanan konsumen, dan dasar-dasar kewirausahaan.',
   'https://images.unsplash.com/photo-1581090700227-1e8e6a8a1b8e?auto=format&fit=crop&w=1200&q=70',
   array['Operasional Toko','Merchandising & Display','Pemasaran & Promosi','Layanan Konsumen','Kewirausahaan Digital'],
   40)
on conflict (slug) do nothing;
