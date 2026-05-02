-- =================================================================
-- Storage bucket untuk video di berita
-- Jalankan di Supabase Dashboard -> Storage:
--   1. Buat bucket bernama "post-videos"
--   2. Centang "Public bucket" supaya video bisa diputar publik di website
--   3. (Opsional) Atur "File size limit" ke 50 MB di pengaturan bucket
--      supaya orang tidak iseng upload video raksasa
--   4. Jalankan policy berikut di SQL Editor
-- =================================================================

-- Public read: siapa pun bisa nonton video di berita publik
drop policy if exists "post-videos public read" on storage.objects;
create policy "post-videos public read"
  on storage.objects for select
  using (bucket_id = 'post-videos');

-- Hanya user login (admin/editor) yang boleh upload/update/delete
drop policy if exists "post-videos authenticated write" on storage.objects;
create policy "post-videos authenticated write"
  on storage.objects for insert
  with check (bucket_id = 'post-videos' and auth.uid() is not null);

drop policy if exists "post-videos authenticated update" on storage.objects;
create policy "post-videos authenticated update"
  on storage.objects for update
  using (bucket_id = 'post-videos' and auth.uid() is not null);

drop policy if exists "post-videos authenticated delete" on storage.objects;
create policy "post-videos authenticated delete"
  on storage.objects for delete
  using (bucket_id = 'post-videos' and auth.uid() is not null);
