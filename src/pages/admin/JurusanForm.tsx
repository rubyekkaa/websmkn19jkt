import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import slugify from 'slugify'
import {
  ArrowLeft,
  ImageOff,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import {
  extractStoragePathFor,
  removeBucketPaths,
} from '../../lib/bucketStorage'
import type { Jurusan } from '../../types'

const BUCKET = 'jurusan-photos'

function makeSlug(s: string): string {
  return slugify(s, { lower: true, strict: true, locale: 'id' })
}

/**
 * Editor list item (kompetensi atau prospek karir). Manage array of strings
 * dengan tambah/hapus item per baris.
 */
function StringListEditor({
  label,
  hint,
  placeholder,
  values,
  onChange,
}: {
  label: string
  hint?: string
  placeholder: string
  values: string[]
  onChange: (next: string[]) => void
}) {
  function update(i: number, v: string) {
    const next = values.slice()
    next[i] = v
    onChange(next)
  }
  function remove(i: number) {
    const next = values.slice()
    next.splice(i, 1)
    onChange(next)
  }
  function add() {
    onChange([...values, ''])
  }
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      <div className="mt-2 space-y-2">
        {values.length === 0 && (
          <p className="rounded-lg border border-dashed border-gray-200 p-3 text-xs text-gray-400">
            Belum ada item. Klik “Tambah” untuk menambahkan.
          </p>
        )}
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={v}
              onChange={(ev) => update(i, ev.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-700"
              aria-label="Hapus item"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah
        </button>
      </div>
    </div>
  )
}

export function AdminJurusanForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isNew = !id

  const fileInputRef = useRef<HTMLInputElement>(null)

  const originalImageUrlRef = useRef<string>('')
  const sessionUploadsRef = useRef<Set<string>>(new Set())

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [shortName, setShortName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [competencies, setCompetencies] = useState<string[]>([])
  const [careerPaths, setCareerPaths] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (isNew) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('jurusan')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (cancelled) return
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      if (!data) {
        setError('Jurusan tidak ditemukan.')
        setLoading(false)
        return
      }
      const j = data as Jurusan
      setName(j.name)
      setSlug(j.slug)
      setSlugTouched(true)
      setShortName(j.short_name ?? '')
      setDescription(j.description ?? '')
      setImageUrl(j.image_url ?? '')
      setDuration(j.duration ?? '')
      setCompetencies(j.competencies ?? [])
      setCareerPaths(j.career_paths ?? [])
      setSortOrder(j.sort_order ?? 0)
      originalImageUrlRef.current = j.image_url ?? ''
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id, isNew])

  async function uploadFile(file: File): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${user?.id ?? 'anon'}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type })
    if (upErr) throw upErr
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  async function onPickImage(file: File | null) {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const url = await uploadFile(file)
      const newPath = extractStoragePathFor(BUCKET, url)
      if (newPath) sessionUploadsRef.current.add(newPath)
      setImageUrl(url)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`Gagal upload foto: ${msg}`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function clearImage() {
    setImageUrl('')
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (!name.trim()) throw new Error('Nama jurusan wajib diisi.')
      const finalSlug = makeSlug(slug.trim() || name)
      if (!finalSlug) throw new Error('Slug tidak valid.')

      const finalImageUrl = imageUrl.trim() || null
      const cleanCompetencies = competencies
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
      const cleanCareerPaths = careerPaths
        .map((c) => c.trim())
        .filter((c) => c.length > 0)

      const payload = {
        slug: finalSlug,
        name: name.trim(),
        short_name: shortName.trim() || null,
        description: description.trim() || null,
        image_url: finalImageUrl,
        duration: duration.trim() || null,
        competencies: cleanCompetencies,
        career_paths: cleanCareerPaths,
        sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
        updated_at: new Date().toISOString(),
      }

      if (isNew) {
        const { error: err } = await supabase.from('jurusan').insert(payload)
        if (err) throw err
      } else {
        const { error: err } = await supabase
          .from('jurusan')
          .update(payload)
          .eq('id', id)
        if (err) throw err
      }

      // Save sukses — cleanup storage seperti di MoUForm.
      const finalPaths = new Set<string>(
        [finalImageUrl]
          .map((u) => extractStoragePathFor(BUCKET, u))
          .filter((p): p is string => Boolean(p)),
      )
      const toRemove = new Set<string>()
      const origPath = extractStoragePathFor(
        BUCKET,
        originalImageUrlRef.current,
      )
      if (origPath && !finalPaths.has(origPath)) toRemove.add(origPath)
      for (const p of sessionUploadsRef.current) {
        if (!finalPaths.has(p)) toRemove.add(p)
      }
      await removeBucketPaths(BUCKET, Array.from(toRemove))

      navigate('/admin/jurusan')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!id) return
    if (!confirm('Hapus jurusan ini?')) return
    const { error: err } = await supabase
      .from('jurusan')
      .delete()
      .eq('id', id)
    if (err) {
      setError(err.message)
      return
    }
    const toRemove = new Set<string>()
    const origPath = extractStoragePathFor(BUCKET, originalImageUrlRef.current)
    if (origPath) toRemove.add(origPath)
    for (const p of sessionUploadsRef.current) {
      toRemove.add(p)
    }
    await removeBucketPaths(BUCKET, Array.from(toRemove))
    navigate('/admin/jurusan')
  }

  return (
    <div className="max-w-3xl">
      <Link
        to="/admin/jurusan"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar jurusan
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-gray-900">
        {isNew ? 'Tambah Jurusan' : 'Edit Jurusan'}
      </h1>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-gray-500">Memuat…</p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nama jurusan <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(ev) => {
                  const v = ev.target.value
                  setName(v)
                  if (isNew && !slugTouched) setSlug(makeSlug(v))
                }}
                placeholder="Akuntansi Keuangan & Lembaga (AKL)"
                required
                className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug URL
              </label>
              <input
                value={slug}
                onChange={(ev) => {
                  setSlugTouched(true)
                  setSlug(ev.target.value)
                }}
                onBlur={(ev) => setSlug(makeSlug(ev.target.value))}
                placeholder="akl"
                className="mt-1 w-full rounded-lg border-gray-300 font-mono text-sm focus:border-brand-500 focus:ring-brand-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Otomatis dari nama. Hindari mengubah setelah dipublikasikan.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subjudul / nama pendek
            </label>
            <input
              value={shortName}
              onChange={(ev) => setShortName(ev.target.value)}
              placeholder="Akuntansi & Keuangan"
              className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Tampil sebagai eyebrow di card jurusan.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Deskripsi jurusan
            </label>
            <textarea
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              rows={4}
              placeholder="Membekali siswa dengan kompetensi akuntansi, perpajakan, audit…"
              className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Foto jurusan
            </label>
            <div className="mt-2 flex flex-wrap items-start gap-4">
              <div className="grid h-32 w-32 flex-none place-items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageOff className="h-7 w-7 text-gray-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(ev) => {
                    void onPickImage(ev.target.files?.[0] ?? null)
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Mengunggah…' : 'Upload Foto'}
                  </button>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-red-50 hover:text-red-700"
                    >
                      <X className="h-4 w-4" /> Hapus
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Atau paste URL gambar (mis. dari Unsplash) di kolom di bawah.
                </p>
                <input
                  value={imageUrl}
                  onChange={(ev) => setImageUrl(ev.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border-gray-300 text-xs focus:border-brand-500 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Durasi pendidikan
              </label>
              <input
                value={duration}
                onChange={(ev) => setDuration(ev.target.value)}
                placeholder="3 tahun (6 semester)"
                className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Urutan tampil
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(ev) => setSortOrder(Number(ev.target.value))}
                className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Angka kecil tampil duluan.
              </p>
            </div>
          </div>

          <StringListEditor
            label="Kompetensi Lulusan"
            hint="Mata pelajaran kejuruan yang dipelajari siswa."
            placeholder="Mis. Dasar Akuntansi"
            values={competencies}
            onChange={setCompetencies}
          />

          <StringListEditor
            label="Prospek Karir"
            hint="Profesi yang dapat ditekuni lulusan."
            placeholder="Mis. Staf Akuntansi"
            values={careerPaths}
            onChange={setCareerPaths}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
            <div>
              {!isNew && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" /> Hapus jurusan
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/admin/jurusan"
                className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
