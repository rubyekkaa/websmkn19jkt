import { supabase } from './supabase'

/**
 * Helper umum untuk Supabase Storage. Dipakai resource yang punya bucket
 * sendiri (mis. ekskul-photos, jurusan-photos). Untuk MoU bucket dipakai
 * versi spesifik di mouStorage.ts agar API publik tetap stabil.
 */

export function extractStoragePathFor(
  bucket: string,
  publicUrl: string | null,
): string | null {
  if (!publicUrl) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(publicUrl.slice(idx + marker.length))
}

export async function cleanupBucketFiles(
  bucket: string,
  ...urls: (string | null | undefined)[]
): Promise<void> {
  const paths = urls
    .map((u) => extractStoragePathFor(bucket, u ?? null))
    .filter((p): p is string => Boolean(p))
  if (paths.length === 0) return
  await supabase.storage.from(bucket).remove(paths)
}

/**
 * Best-effort cleanup: error di-log tapi tidak dilempar, supaya kegagalan
 * cleanup tidak menghalangi flow utama (save / delete).
 */
export async function removeBucketPaths(
  bucket: string,
  paths: string[],
): Promise<void> {
  if (paths.length === 0) return
  const { error } = await supabase.storage.from(bucket).remove(paths)
  if (error) {
    console.warn(`[${bucket}] gagal cleanup storage`, error)
  }
}
