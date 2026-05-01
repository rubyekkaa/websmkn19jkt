-- =================================================================
-- Migrasi: Tabel Tenaga Pendidik & Kependidikan (teachers)
-- Jalankan di Supabase SQL Editor.
-- File ini aman dijalankan ulang (idempotent) — pakai
--   "create table if not exists", "drop policy if exists", dan
--   "on conflict (name) do nothing" untuk seed.
-- =================================================================

-- Pastikan extension uuid_generate_v4/gen_random_uuid tersedia
create extension if not exists "pgcrypto";

-- 1) Tabel teachers
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  jabatan text not null,
  kategori text not null,
  grup text not null check (grup in ('Guru', 'Tata Usaha')),
  foto_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teachers_grup_sort_idx
  on public.teachers(grup, sort_order, name);

-- 2) Row Level Security
alter table public.teachers enable row level security;

drop policy if exists "teachers public read" on public.teachers;
create policy "teachers public read"
  on public.teachers for select
  using (true);

drop policy if exists "teachers admin write" on public.teachers;
create policy "teachers admin write"
  on public.teachers for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- 3) Storage bucket teacher-photos
-- Sebelum policy ini di-apply, buat bucket "teacher-photos" via Dashboard
-- (Storage -> New bucket -> name: teacher-photos -> Public bucket).
drop policy if exists "teacher-photos public read" on storage.objects;
create policy "teacher-photos public read"
  on storage.objects for select
  using (bucket_id = 'teacher-photos');

drop policy if exists "teacher-photos authenticated write" on storage.objects;
create policy "teacher-photos authenticated write"
  on storage.objects for insert
  with check (bucket_id = 'teacher-photos' and auth.uid() is not null);

drop policy if exists "teacher-photos authenticated update" on storage.objects;
create policy "teacher-photos authenticated update"
  on storage.objects for update
  using (bucket_id = 'teacher-photos' and auth.uid() is not null);

drop policy if exists "teacher-photos authenticated delete" on storage.objects;
create policy "teacher-photos authenticated delete"
  on storage.objects for delete
  using (bucket_id = 'teacher-photos' and auth.uid() is not null);

-- =================================================================
-- Seed data: 52 entri (39 Guru + 13 Tata Usaha)
-- Sumber: https://smkn19jkt.sch.id/profil
-- =================================================================
insert into public.teachers (name, jabatan, kategori, grup, sort_order) values
  -- Kepala Sekolah (1)
  ('Sri Muljani, S.Pd.', 'Kepala Sekolah', 'Kepala Sekolah', 'Guru', 10),

  -- Wakil Kepala Sekolah (4)
  ('Titin Nafisah, S.Ag.', 'Wakil Kepala Sekolah Bidang Kesiswaan', 'Wakil Kepala Sekolah', 'Guru', 20),
  ('Sumiati Sunarsih, S.Pd.', 'Wakil Kepala Sekolah Bidang Kurikulum', 'Wakil Kepala Sekolah', 'Guru', 21),
  ('Mohamad Rozikin, S.Pd.', 'Wakil Kepala Sekolah Bidang Humas', 'Wakil Kepala Sekolah', 'Guru', 22),
  ('Ngatman, S.Pd.', 'Wakil Kepala Sekolah Bidang Sarana dan Prasarana', 'Wakil Kepala Sekolah', 'Guru', 23),

  -- Guru Produktif (18)
  ('Wahyu Lukman Hakim, S.Kom.', 'Guru Produktif Produksi Film', 'Guru Produktif', 'Guru', 30),
  ('Ruby Eka Prawira, S.Pd.', 'Guru Produktif Produksi Film', 'Guru Produktif', 'Guru', 31),
  ('Putu Arya Ranesda, S.Kom.', 'Guru Produktif Produksi Film', 'Guru Produktif', 'Guru', 32),
  ('Sumantoro Kasdhani, S.Kom., M.I.Kom.', 'Guru Produktif Produksi Film', 'Guru Produktif', 'Guru', 33),
  ('Drs. Abdul Kariem, M.Pd.', 'Guru Produktif Bisnis Retail', 'Guru Produktif', 'Guru', 34),
  ('Vincelina Sigalingging, S.Pd.', 'Guru Produktif Bisnis Retail', 'Guru Produktif', 'Guru', 35),
  ('Rose Rosidah, S.Pd.', 'Guru Produktif Bisnis Retail', 'Guru Produktif', 'Guru', 36),
  ('Hadijah, S.Pd.', 'Guru Produktif Akuntansi', 'Guru Produktif', 'Guru', 37),
  ('Lilik Priyatmi, S.E.', 'Guru Produktif Akuntansi', 'Guru Produktif', 'Guru', 38),
  ('Ratna Ningsih, S.Pd.', 'Guru Produktif Akuntansi', 'Guru Produktif', 'Guru', 39),
  ('Jangasih Situngkir, S.E., M.M.', 'Guru Produktif Akuntansi', 'Guru Produktif', 'Guru', 40),
  ('Dian Santi Warastuti, S.E., M.Pd.', 'Guru Produktif Akuntansi', 'Guru Produktif', 'Guru', 41),
  ('Elis Muchlisah, S.E.', 'Guru Produktif Akuntansi', 'Guru Produktif', 'Guru', 42),
  ('Elis Setyowati, M.Pd.', 'Guru Produktif Akuntansi', 'Guru Produktif', 'Guru', 43),
  ('Nani Aminah, S.E.', 'Guru Produktif Akuntansi', 'Guru Produktif', 'Guru', 44),
  ('Dra. Endang Puji Rahayu, M.Pd.', 'Guru Produktif MPLB', 'Guru Produktif', 'Guru', 45),
  ('Christine Rambing, S.Pd.', 'Guru Produktif MPLB', 'Guru Produktif', 'Guru', 46),
  ('Lisnur, S.IP.', 'Guru Produktif MPLB', 'Guru Produktif', 'Guru', 47),

  -- Guru Lainnya (16)
  ('Robert Henry, S.Si., M.Pd.', 'Guru Matematika', 'Guru Lainnya', 'Guru', 50),
  ('Endang Sukasih, S.Pd.', 'Guru Matematika', 'Guru Lainnya', 'Guru', 51),
  ('Ridwan Pratama Setiawan, S.Pd.', 'Guru Matematika', 'Guru Lainnya', 'Guru', 52),
  ('Tulus, S.Pd.', 'Guru Olahraga', 'Guru Lainnya', 'Guru', 53),
  ('Suwandi, S.Pd.', 'Guru PKN', 'Guru Lainnya', 'Guru', 54),
  ('Irfan Febrian, S.T.', 'Guru Informatika', 'Guru Lainnya', 'Guru', 55),
  ('Moch Arif, S.Pd.', 'Guru Seni Budaya', 'Guru Lainnya', 'Guru', 56),
  ('Muthia Nurrahma Khairani, S.Pd.', 'Guru BK', 'Guru Lainnya', 'Guru', 57),
  ('Ananda Deviana, S.Pd.', 'Guru BK', 'Guru Lainnya', 'Guru', 58),
  ('Dra. Ermida Gusmelinda', 'Guru Bahasa Indonesia', 'Guru Lainnya', 'Guru', 59),
  ('Erna Cahyani, S.Pd.', 'Guru Bahasa Indonesia', 'Guru Lainnya', 'Guru', 60),
  ('Lily Andriani, S.Pd.', 'Guru Bahasa Inggris', 'Guru Lainnya', 'Guru', 61),
  ('Ika Inayah, S.Pd.', 'Guru Bahasa Inggris', 'Guru Lainnya', 'Guru', 62),
  ('Anisa Ismyati Sari, M.Pd.', 'Guru Bahasa Inggris', 'Guru Lainnya', 'Guru', 63),
  ('Englena Nastaria Purba, S.Pd.', 'Guru Sejarah', 'Guru Lainnya', 'Guru', 64),
  ('Lutfi Faridil Aftros, S.Pd.I.', 'Guru Agama Islam', 'Guru Lainnya', 'Guru', 65),

  -- Kepala Tata Usaha (1)
  ('Vidya Ayuningtyas, S.Si., M.Si.', 'Kepala Tata Usaha', 'Kepala Tata Usaha', 'Tata Usaha', 100),

  -- Staf Tata Usaha (7)
  ('Ahmad Safrudin', 'Staf Tata Usaha', 'Staf Tata Usaha', 'Tata Usaha', 110),
  ('Rahma Maulidya, A.Md.', 'Staf Tata Usaha', 'Staf Tata Usaha', 'Tata Usaha', 111),
  ('Rita Yusniar Siringo Ringo, S.AP.', 'Staf Tata Usaha', 'Staf Tata Usaha', 'Tata Usaha', 112),
  ('Eka Herawati, S.Pd.', 'Staf Tata Usaha', 'Staf Tata Usaha', 'Tata Usaha', 113),
  ('Adeng Nugraha, S.Kom.', 'Staf Tata Usaha', 'Staf Tata Usaha', 'Tata Usaha', 114),
  ('Andi Ami, S.Kom.', 'Staf Tata Usaha', 'Staf Tata Usaha', 'Tata Usaha', 115),
  ('Iqbal Irwandi', 'Staf Tata Usaha', 'Staf Tata Usaha', 'Tata Usaha', 116),

  -- Caraka (3)
  ('Barkatulloh', 'Caraka', 'Caraka', 'Tata Usaha', 120),
  ('Supriyadi', 'Caraka', 'Caraka', 'Tata Usaha', 121),
  ('M. Argil Ramadhani', 'Caraka', 'Caraka', 'Tata Usaha', 122),

  -- Penjaga Sekolah (2)
  ('Slamet Budi Santoso', 'Penjaga Sekolah', 'Penjaga Sekolah', 'Tata Usaha', 130),
  ('Sri Dadi', 'Penjaga Sekolah', 'Penjaga Sekolah', 'Tata Usaha', 131)
on conflict (name) do nothing;
