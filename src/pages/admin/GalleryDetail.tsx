import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ImageOff,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import type { GalleryCollection, GalleryPhoto } from '../../types'

const NEW_SLUG_SENTINEL = 'new'

const CATEGORY_OPTIONS = [
  { value: '', label: '— pilih kategori —' },
  { value: 'humas-dudi', label: 'Humas/DUDI' },
  { value: 'kesiswaan', label: 'Kesiswaan' },
  { value: 'sarpras', label: 'Sarpras' },
  { value: 'lainnya', label: 'Lainnya' },
]

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function AdminGalleryDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isNew = slug === NEW_SLUG_SENTINEL
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [collection, setCollection] = useState<GalleryCollection | null>(null)
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState<string | null>(null)
  const [savingMeta, setSavingMeta] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null)
  // True setelah user mengetik manual di field slug. Selama belum disentuh,
  // slug auto-mengikuti nama (di-slugify). Sekali user mengedit slug, kita
  // berhenti auto-generate.
  const [slugTouched, setSlugTouched] = useState(false)

  // form state for collection metadata
  const [name, setName] = useState('')
  const [collSlug, setCollSlug] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')

  async function loadCollection(currentSlug: string) {
    setLoading(true)
    setError(null)
    const { data: col, error: colErr } = await supabase
      .from('gallery_collections')
      .select('*')
      .eq('slug', currentSlug)
      .maybeSingle()
    if (colErr) {
      setError(colErr.message)
      setLoading(false)
      return
    }
    if (!col) {
      setError('Koleksi tidak ditemukan.')
      setLoading(false)
      return
    }
    const c = col as GalleryCollection
    setCollection(c)
    setName(c.name)
    setCollSlug(c.slug)
    setCategory(c.category ?? '')
    setDescription(c.description ?? '')
    setCoverUrl(c.cover_url ?? '')

    const { data: ph, error: phErr } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('collection_id', c.id)
      .order('sort_order', { ascending: true })
    if (phErr) {
      setError(phErr.message)
      setLoading(false)
      return
    }
    setPhotos((ph ?? []) as GalleryPhoto[])
    setLoading(false)
  }

  useEffect(() => {
    if (isNew) {
      setLoading(false)
      return
    }
    if (slug) void loadCollection(slug)
  }, [slug, isNew])

  async function onSaveMeta(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSavingMeta(true)
    try {
      if (!name.trim()) throw new Error('Nama koleksi wajib diisi.')
      // Slugify ulang saat submit — input slug nyimpan raw text supaya user
      // bisa ngetik hyphen tanpa kena trim, tapi yang masuk DB tetap clean.
      const finalSlug = slugify(collSlug.trim() || name) || ''
      if (!finalSlug) throw new Error('Slug tidak valid.')
      if (finalSlug === NEW_SLUG_SENTINEL) {
        throw new Error(
          `Slug "${NEW_SLUG_SENTINEL}" dicadangkan oleh sistem. Pakai slug lain.`,
        )
      }

      const payload = {
        name: name.trim(),
        slug: finalSlug,
        category: category.trim() || null,
        description: description.trim() || null,
        cover_url: coverUrl.trim() || null,
        updated_at: new Date().toISOString(),
      }

      if (isNew) {
        const { data, error: err } = await supabase
          .from('gallery_collections')
          .insert(payload)
          .select('slug')
          .single()
        if (err) throw err
        navigate(`/admin/galleries/${(data as { slug: string }).slug}`, {
          replace: true,
        })
        return
      }

      if (!collection) throw new Error('Koleksi belum dimuat.')
      const { error: err } = await supabase
        .from('gallery_collections')
        .update(payload)
        .eq('id', collection.id)
      if (err) throw err

      // Slug bisa berubah → reload pakai slug baru
      if (finalSlug !== collection.slug) {
        navigate(`/admin/galleries/${finalSlug}`, { replace: true })
      } else {
        await loadCollection(finalSlug)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setSavingMeta(false)
    }
  }

  async function onDeleteCollection() {
    if (!collection) return
    if (
      !confirm(
        `Hapus koleksi "${collection.name}" beserta semua fotonya? Tidak bisa dibatalkan.`,
      )
    )
      return
    // Hapus row → ON DELETE CASCADE menghapus photos.
    // Storage object dihapus best-effort di sisi browser.
    const filesToDelete = photos
      .map((p) => extractStoragePath(p.image_url))
      .filter((x): x is string => Boolean(x))
    const { error: err } = await supabase
      .from('gallery_collections')
      .delete()
      .eq('id', collection.id)
    if (err) {
      setError(err.message)
      return
    }
    if (filesToDelete.length > 0) {
      await supabase.storage.from('gallery-photos').remove(filesToDelete)
    }
    navigate('/admin/galleries', { replace: true })
  }

  async function onPickFiles(files: FileList | null) {
    if (!files || !collection) return
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) return
    setUploading(true)
    setError(null)
    setUploadProgress({ done: 0, total: list.length })

    const baseSort =
      photos.reduce((max, p) => Math.max(max, p.sort_order), 0) + 10

    let done = 0
    for (let i = 0; i < list.length; i++) {
      const file = list[i]
      try {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${collection.slug}/${user?.id ?? 'anon'}/${Date.now()}-${i}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('gallery-photos')
          .upload(path, file, { upsert: false, contentType: file.type })
        if (upErr) throw upErr
        const { data } = supabase.storage
          .from('gallery-photos')
          .getPublicUrl(path)
        const { error: insErr } = await supabase
          .from('gallery_photos')
          .insert({
            collection_id: collection.id,
            image_url: data.publicUrl,
            caption: null,
            sort_order: baseSort + i * 10,
          })
        if (insErr) throw insErr
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(`Gagal upload "${file.name}": ${msg}`)
        // continue mengupload sisa file
      }
      done++
      setUploadProgress({ done, total: list.length })
    }
    setUploading(false)
    setUploadProgress(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    await loadCollection(collection.slug)
  }

  async function onUpdatePhoto(id: string, patch: Partial<GalleryPhoto>) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    const { error: err } = await supabase
      .from('gallery_photos')
      .update(patch)
      .eq('id', id)
    if (err) {
      setError(err.message)
    }
  }

  async function onDeletePhoto(p: GalleryPhoto) {
    if (!confirm('Hapus foto ini?')) return
    const { error: err } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('id', p.id)
    if (err) {
      setError(err.message)
      return
    }
    const path = extractStoragePath(p.image_url)
    if (path) {
      await supabase.storage.from('gallery-photos').remove([path])
    }
    setPhotos((prev) => prev.filter((x) => x.id !== p.id))
  }

  async function onMove(p: GalleryPhoto, direction: -1 | 1) {
    const idx = photos.findIndex((x) => x.id === p.id)
    if (idx === -1) return
    const swapWith = photos[idx + direction]
    if (!swapWith) return
    const a = { ...p, sort_order: swapWith.sort_order }
    const b = { ...swapWith, sort_order: p.sort_order }
    const next = [...photos]
    // p (a) pindah ke posisi swapWith, swapWith (b) pindah ke posisi p —
    // berlaku untuk move up & move down.
    next[idx] = b
    next[idx + direction] = a
    setPhotos(next)
    // Persist swap; tidak harus menunggu kedua selesai untuk UX cepat
    await Promise.all([
      supabase
        .from('gallery_photos')
        .update({ sort_order: a.sort_order })
        .eq('id', a.id),
      supabase
        .from('gallery_photos')
        .update({ sort_order: b.sort_order })
        .eq('id', b.id),
    ])
  }

  const photoCount = useMemo(() => photos.length, [photos])

  return (
    <div className="max-w-5xl">
      <Link
        to="/admin/galleries"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar koleksi
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-gray-900">
        {isNew ? 'Koleksi Baru' : collection?.name ?? 'Memuat…'}
      </h1>
      {!isNew && collection && (
        <p className="mt-1 text-sm text-gray-500">
          Slug:{' '}
          <code className="rounded bg-gray-100 px-1 text-gray-700">
            {collection.slug}
          </code>{' '}
          · {photoCount} foto
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-gray-500">Memuat…</p>
      ) : (
        <>
          {/* Form metadata koleksi */}
          <form
            onSubmit={onSaveMeta}
            className="mt-6 space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="font-display text-lg font-semibold text-gray-900">
              Detail Koleksi
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => {
                    const v = e.target.value
                    setName(v)
                    // Auto-isi slug selama user belum manually edit field slug.
                    if (isNew && !slugTouched) setCollSlug(slugify(v))
                  }}
                  required
                  className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Slug (URL){' '}
                  <span className="text-gray-400">— huruf kecil, tanpa spasi</span>
                </label>
                <input
                  value={collSlug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setCollSlug(e.target.value)
                  }}
                  onBlur={(e) => setCollSlug(slugify(e.target.value))}
                  placeholder="kunjungan-industri"
                  className="mt-1 w-full rounded-lg border-gray-300 text-sm font-mono focus:border-brand-500 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cover URL{' '}
                  <span className="text-gray-400">— opsional</span>
                </label>
                <input
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://…"
                  className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Deskripsi <span className="text-gray-400">— opsional</span>
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <div className="text-xs text-gray-500">
                Slug ini dipakai oleh URL publik. Misal{' '}
                <code className="rounded bg-gray-100 px-1">kunjungan-industri</code>{' '}
                tampil di halaman{' '}
                <code className="rounded bg-gray-100 px-1">
                  /humas-dudi/kunjungan-industri
                </code>
                .
              </div>
              <div className="flex items-center gap-3">
                {!isNew && collection && (
                  <button
                    type="button"
                    onClick={onDeleteCollection}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Hapus koleksi
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingMeta}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {savingMeta ? 'Menyimpan…' : isNew ? 'Buat & lanjut' : 'Simpan'}
                </button>
              </div>
            </div>
          </form>

          {/* Photos: hanya muncul kalau koleksi sudah ada */}
          {!isNew && collection && (
            <section className="mt-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold text-gray-900">
                    Foto ({photoCount})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Klik panah untuk ubah urutan, edit caption inline, atau hapus.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => onPickFiles(e.target.files)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading
                      ? `Mengunggah… ${uploadProgress?.done ?? 0}/${uploadProgress?.total ?? 0}`
                      : 'Unggah foto'}
                  </button>
                </div>
              </div>

              {photos.length === 0 ? (
                <div className="mt-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                  <Plus className="mx-auto h-10 w-10 text-gray-300" />
                  <h3 className="mt-3 font-display text-base font-semibold text-gray-900">
                    Belum ada foto
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Klik <strong>Unggah foto</strong> di atas untuk mulai
                    menambahkan foto. Bisa pilih banyak file sekaligus (Ctrl/Shift+klik).
                  </p>
                </div>
              ) : (
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {photos.map((p, i) => (
                    <li
                      key={p.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="relative aspect-[4/3] bg-gray-100">
                        <img
                          src={p.image_url}
                          alt={p.caption ?? 'Foto'}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const t = e.currentTarget
                            t.style.display = 'none'
                            const sib = t.nextElementSibling as HTMLElement | null
                            if (sib) sib.style.display = 'flex'
                          }}
                        />
                        <div
                          className="absolute inset-0 hidden items-center justify-center text-gray-300"
                          style={{ display: 'none' }}
                        >
                          <ImageOff className="h-10 w-10" />
                        </div>
                        <div className="absolute right-2 top-2 flex gap-1 rounded-full bg-white/90 p-1 shadow-sm backdrop-blur">
                          <button
                            type="button"
                            disabled={i === 0}
                            onClick={() => onMove(p, -1)}
                            title="Pindah ke atas"
                            className="rounded-full p-1.5 text-gray-700 transition hover:bg-gray-100 disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={i === photos.length - 1}
                            onClick={() => onMove(p, 1)}
                            title="Pindah ke bawah"
                            className="rounded-full p-1.5 text-gray-700 transition hover:bg-gray-100 disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeletePhoto(p)}
                            title="Hapus"
                            className="rounded-full p-1.5 text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 p-3">
                        <textarea
                          rows={2}
                          value={p.caption ?? ''}
                          onChange={(e) =>
                            setPhotos((prev) =>
                              prev.map((x) =>
                                x.id === p.id
                                  ? { ...x, caption: e.target.value }
                                  : x,
                              ),
                            )
                          }
                          onBlur={(e) =>
                            onUpdatePhoto(p.id, {
                              caption: e.target.value || null,
                            })
                          }
                          placeholder="Caption (opsional)…"
                          className="w-full resize-none rounded-lg border-gray-200 text-xs focus:border-brand-500 focus:ring-brand-500"
                        />
                        <div className="flex items-center justify-between gap-2 text-[10px] text-gray-400">
                          <span>#{i + 1}</span>
                          <input
                            type="date"
                            value={p.taken_at ?? ''}
                            onChange={(e) =>
                              setPhotos((prev) =>
                                prev.map((x) =>
                                  x.id === p.id
                                    ? { ...x, taken_at: e.target.value || null }
                                    : x,
                                ),
                              )
                            }
                            onBlur={(e) =>
                              onUpdatePhoto(p.id, {
                                taken_at: e.target.value || null,
                              })
                            }
                            className="rounded border-gray-200 text-[10px] text-gray-600 focus:border-brand-500 focus:ring-brand-500"
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}

function extractStoragePath(publicUrl: string): string | null {
  const marker = '/storage/v1/object/public/gallery-photos/'
  const i = publicUrl.indexOf(marker)
  if (i === -1) return null
  return decodeURIComponent(publicUrl.slice(i + marker.length))
}
