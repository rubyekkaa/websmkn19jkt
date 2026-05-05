import { supabase } from './supabase'

export const MOU_BUCKET = 'mou-files'

/**
 * Ekstrak storage path dari public URL Supabase. Kembalikan null kalau URL
 * bukan URL bucket `mou-files` (mis. URL eksternal yang di-paste user).
 */
export function extractStoragePath(publicUrl: string | null): string | null {
  if (!publicUrl) return null
  const marker = `/storage/v1/object/public/${MOU_BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(publicUrl.slice(idx + marker.length))
}

/**
 * Best-effort cleanup file logo + dokumen dari bucket `mou-files`. URL yang
 * bukan URL bucket di-skip diam-diam (untuk mendukung admin yang paste link
 * eksternal sebagai logo/dokumen).
 */
export async function cleanupMoUFiles(
  ...urls: (string | null | undefined)[]
): Promise<void> {
  const paths = urls
    .map((u) => extractStoragePath(u ?? null))
    .filter((p): p is string => Boolean(p))
  if (paths.length === 0) return
  await supabase.storage.from(MOU_BUCKET).remove(paths)
}
