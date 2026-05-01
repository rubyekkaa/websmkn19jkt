-- =================================================================
-- Migrasi: Role-Based Access (admin / editor)
--
-- Role:
--   * admin  : akses penuh ke semua menu admin (berita, kategori,
--              tag, guru/TU, kelola pengguna)
--   * editor : hanya berita, kategori, tag (TIDAK bisa kelola
--              guru/TU dan pengguna)
--
-- Aman dijalankan ulang (idempotent).
-- =================================================================

create extension if not exists "pgcrypto";

-- 1) Tabel profiles (1:1 dengan auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Helper: cek apakah user dengan uid tertentu adalah admin
--    SECURITY DEFINER supaya bypass RLS profiles ketika dipanggil dari
--    policy lain (mencegah infinite recursion).
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = uid),
    false
  );
$$;

-- 3) Trigger: auto-create profile saat user baru sign up.
--    Email "rubyekkaa@gmail.com" otomatis di-set role 'admin'.
--    User lain default role 'editor'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    case when new.email = 'rubyekkaa@gmail.com' then 'admin' else 'editor' end,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Backfill: bikin profile untuk user yang sudah terdaftar
insert into public.profiles (id, email, role, full_name)
select
  u.id,
  u.email,
  case when u.email = 'rubyekkaa@gmail.com' then 'admin' else 'editor' end,
  coalesce(u.raw_user_meta_data->>'full_name', u.email)
from auth.users u
on conflict (id) do nothing;

-- Sinkronkan email kalau ada perubahan
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and (p.email is null or p.email is distinct from u.email);

-- 5) RLS untuk profiles
alter table public.profiles enable row level security;

drop policy if exists "profiles select self or admin" on public.profiles;
create policy "profiles select self or admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles update self limited or admin" on public.profiles;
create policy "profiles update self limited or admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (
    public.is_admin(auth.uid())
    or (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()))
  );

drop policy if exists "profiles insert admin only" on public.profiles;
create policy "profiles insert admin only"
  on public.profiles for insert
  with check (public.is_admin(auth.uid()));

drop policy if exists "profiles delete admin only" on public.profiles;
create policy "profiles delete admin only"
  on public.profiles for delete
  using (public.is_admin(auth.uid()));

-- 6) Update RLS untuk tabel teachers — hanya admin yang boleh write.
--    (Public read tetap diizinkan, sudah ada di teachers.sql.)
drop policy if exists "teachers admin write" on public.teachers;
create policy "teachers admin write"
  on public.teachers for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- 7) Update storage policies untuk bucket teacher-photos — hanya admin.
drop policy if exists "teacher-photos authenticated write" on storage.objects;
drop policy if exists "teacher-photos authenticated update" on storage.objects;
drop policy if exists "teacher-photos authenticated delete" on storage.objects;
drop policy if exists "teacher-photos admin write" on storage.objects;
drop policy if exists "teacher-photos admin update" on storage.objects;
drop policy if exists "teacher-photos admin delete" on storage.objects;

create policy "teacher-photos admin write"
  on storage.objects for insert
  with check (bucket_id = 'teacher-photos' and public.is_admin(auth.uid()));

create policy "teacher-photos admin update"
  on storage.objects for update
  using (bucket_id = 'teacher-photos' and public.is_admin(auth.uid()));

create policy "teacher-photos admin delete"
  on storage.objects for delete
  using (bucket_id = 'teacher-photos' and public.is_admin(auth.uid()));

-- 8) Catatan: tabel posts / categories / tags / post_tags tetap pakai
--    policy yang ada (any authenticated user). Editor & admin sama-sama
--    bisa CRUD. Pembatasan menu dilakukan di sisi frontend.
