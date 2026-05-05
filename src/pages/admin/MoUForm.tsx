import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  ImageOff,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import {
  MOU_BUCKET as BUCKET,
  cleanupMoUFiles,
  extractStoragePath,
} from '../../lib/mouStorage'
import type { MoUPartner, MoUStatus } from '../../types'

const STATUS_OPTIONS: { value: MoUStatus; label: string }[] = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'berakhir', label: 'Berakhir' },
]

export function AdminMoUForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isNew = !id

  const logoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [partnerName, setPartnerName] = useState('')
  const [description, setDescription] = useState('')
  const [signedAt, setSignedAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [status, setStatus] = useState<MoUStatus>('aktif')
  const [logoUrl, setLogoUrl] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)

  useEffect(() => {
    if (isNew) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('mou_partners')
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
        setError('MoU tidak ditemukan.')
        setLoading(false)
        return
      }
      const m = data as MoUPartner
      setPartnerName(m.partner_name)
      setDescription(m.description ?? '')
      setSignedAt(m.signed_at)
      setExpiresAt(m.expires_at ?? '')
      setStatus((m.status ?? 'aktif') as MoUStatus)
      setLogoUrl(m.partner_logo_url ?? '')
      setDocumentUrl(m.document_url ?? '')
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id, isNew])

  async function uploadFile(
    file: File,
    folder: 'logos' | 'documents',
  ): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${folder}/${user?.id ?? 'anon'}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type })
    if (upErr) throw upErr
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  async function onPickLogo(file: File | null) {
    if (!file) return
    setError(null)
    setUploadingLogo(true)
    // Catat path lama SEBELUM state ditimpa, supaya bisa dibersihkan
    // setelah upload baru sukses (kalau lama dari bucket kita).
    const oldPath = extractStoragePath(logoUrl)
    try {
      const url = await uploadFile(file, 'logos')
      setLogoUrl(url)
      if (oldPath) {
        await supabase.storage.from(BUCKET).remove([oldPath])
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`Gagal upload logo: ${msg}`)
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  async function onPickDoc(file: File | null) {
    if (!file) return
    setError(null)
    setUploadingDoc(true)
    const oldPath = extractStoragePath(documentUrl)
    try {
      const url = await uploadFile(file, 'documents')
      setDocumentUrl(url)
      if (oldPath) {
        await supabase.storage.from(BUCKET).remove([oldPath])
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`Gagal upload dokumen: ${msg}`)
    } finally {
      setUploadingDoc(false)
      if (docInputRef.current) docInputRef.current.value = ''
    }
  }

  async function clearLogo() {
    const path = extractStoragePath(logoUrl)
    setLogoUrl('')
    if (path) {
      // best-effort hapus dari storage
      await supabase.storage.from(BUCKET).remove([path])
    }
  }

  async function clearDoc() {
    const path = extractStoragePath(documentUrl)
    setDocumentUrl('')
    if (path) {
      await supabase.storage.from(BUCKET).remove([path])
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (!partnerName.trim()) throw new Error('Nama mitra wajib diisi.')
      if (!signedAt) throw new Error('Tanggal tandatangan wajib diisi.')

      const payload = {
        partner_name: partnerName.trim(),
        description: description.trim() || null,
        signed_at: signedAt,
        expires_at: expiresAt || null,
        partner_logo_url: logoUrl.trim() || null,
        document_url: documentUrl.trim() || null,
        status,
        updated_at: new Date().toISOString(),
      }

      if (isNew) {
        const { error: err } = await supabase
          .from('mou_partners')
          .insert(payload)
        if (err) throw err
      } else {
        const { error: err } = await supabase
          .from('mou_partners')
          .update(payload)
          .eq('id', id)
        if (err) throw err
      }
      navigate('/admin/mou')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!id) return
    if (!confirm('Hapus MoU ini?')) return
    const { error: err } = await supabase
      .from('mou_partners')
      .delete()
      .eq('id', id)
    if (err) {
      setError(err.message)
      return
    }
    // Best-effort cleanup file logo + dokumen yang sebelumnya di-upload
    // ke bucket mou-files. URL eksternal (non-bucket) di-skip otomatis.
    await cleanupMoUFiles(logoUrl, documentUrl)
    navigate('/admin/mou')
  }

  return (
    <div className="max-w-3xl">
      <Link
        to="/admin/mou"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar MoU
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-gray-900">
        {isNew ? 'Tambah MoU' : 'Edit MoU'}
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama mitra <span className="text-red-500">*</span>
            </label>
            <input
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="PT Trans Media Corpora"
              required
              className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Deskripsi kerja sama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Magang siswa Produksi Film, guru tamu, penyaluran alumni…"
              className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tanggal tandatangan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={signedAt}
                onChange={(e) => setSignedAt(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Berlaku sampai
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MoUStatus)}
                className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Logo mitra */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Logo mitra
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-16 w-16 rounded-lg border border-gray-200 object-contain p-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-lg border border-dashed border-gray-300 text-gray-400">
                  <ImageOff className="h-6 w-6" />
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => onPickLogo(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                disabled={uploadingLogo}
                onClick={() => logoInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {uploadingLogo ? 'Mengunggah…' : 'Unggah logo'}
              </button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => void clearLogo()}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                >
                  <X className="h-3 w-3" /> Hapus
                </button>
              )}
            </div>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="…atau paste URL logo"
              className="mt-2 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>

          {/* Dokumen MoU */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dokumen MoU (PDF)
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {documentUrl ? (
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-gray-100"
                >
                  <Building2 className="h-4 w-4" /> Lihat dokumen
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-xs text-gray-400">Belum ada dokumen</span>
              )}
              <input
                ref={docInputRef}
                type="file"
                accept="application/pdf,.pdf"
                hidden
                onChange={(e) => onPickDoc(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                disabled={uploadingDoc}
                onClick={() => docInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {uploadingDoc ? 'Mengunggah…' : 'Unggah PDF'}
              </button>
              {documentUrl && (
                <button
                  type="button"
                  onClick={() => void clearDoc()}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                >
                  <X className="h-3 w-3" /> Hapus
                </button>
              )}
            </div>
            <input
              type="url"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="…atau paste URL dokumen"
              className="mt-2 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
            {!isNew && (
              <button
                type="button"
                onClick={() => void onDelete()}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Hapus
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
