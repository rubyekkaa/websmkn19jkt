-- Seed gallery collection for UKS (Unit Kesehatan Sekolah).
-- Idempotent: safe to run multiple times.

insert into public.gallery_collections (slug, name, category, description, sort_order) values
  ('sarpras-uks', 'UKS', 'sarpras', 'Unit Kesehatan Sekolah — ruang istirahat & layanan kesehatan siswa.', 110)
on conflict (slug) do nothing;
