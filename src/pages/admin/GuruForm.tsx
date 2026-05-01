import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImageIcon, Save, Upload, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import type { Teacher, TeacherGrup } from '../../types'

type FormState = {
  name: string
  jabatan: string
  kategori: string
  grup: TeacherGrup
  foto_url: string
  sort_order: number
}

const EMPTY: FormState = {
  name: '',
  jabatan: '',
  kategori: '',
  grup: 'Guru',
  foto_url: '',
  sort_order: 0,
}

const KATEGORI_GURU = [
  'Kepala Sekolah',
  'Wakil Kepala Sekolah',
  'Guru Produktif',
  'Guru Lainnya',
]
const KATEGORI_TU = [
  'Kepala Tata Usaha',
  'Staf Tata Usaha',
  'Caraka',
  'Penjaga Sekolah',
]

export function AdminGuruForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit || !id) return
    async function load() {
      const { data, error: err } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (err || !data) {
        setError(err?.message ?? 'Data guru tidak ditemukan.')
        setLoading(false)
        return
      }
      const t = data as Teacher
      setForm({
        name: t.name,
        jabatan: t.jabatan,
        kategori: t.kategori,
        grup: t.grup,
        foto_url: t.foto_url ?? '',
        sort_order: t.sort_order,
      })
      setLoading(false)
    }
    void load()
  }, [id, isEdit])

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function onUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user?.id ?? 'anon'}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('teacher-photos')
        .upload(path, file, { upsert: false, contentType: file.type })
      if (upErr) throw upErr
      const { data } = supabase.storage
        .from('teacher-photos')
        .getPublicUrl(path)
      set('foto_url', data.publicUrl)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`Gagal mengunggah: ${msg}`)
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (!form.name.trim()) throw new Error('Nama wajib diisi.')
      if (!form.jabatan.trim()) throw new Error('Jabatan wajib diisi.')
      if (!form.kategori.trim()) throw new Error('Kategori wajib diisi.')

      const payload = {
        name: form.name.trim(),
        jabatan: form.jabatan.trim(),
        kategori: form.kategori.trim(),
        grup: form.grup,
        foto_url: form.foto_url.trim() || null,
        sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
        updated_at: new Date().toISOString(),
      }

      if (isEdit && id) {
        const { error: err } = await supabase
          .from('teachers')
          .update(payload)
          .eq('id', id)
        if (err) throw err
      } else {
        const { error: err } = await supabase
          .from('teachers')
          .insert(payload)
        if (err) throw err
      }

      navigate('/admin/guru')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Memuat…</p>
  }

  const kategoriList = form.grup === 'Guru' ? KATEGORI_GURU : KATEGORI_TU

  return (
    <div className="max-w-3xl">
      <Link
        to="/admin/guru"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit Guru / TU' : 'Tambah Guru / TU'}
      </h1>

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nama lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Misal: Budi Santoso, S.Pd."
            required
            className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Jabatan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.jabatan}
            onChange={(e) => set('jabatan', e.target.value)}
            placeholder="Misal: Guru Matematika, Wakil Kepala Sekolah Bidang Kesiswaan"
            required
            className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Grup <span className="text-red-500">*</span>
            </label>
            <select
              value={form.grup}
              onChange={(e) => {
                const g = e.target.value as TeacherGrup
                set('grup', g)
                // Reset kategori jika tidak valid untuk grup baru
                const list = g === 'Guru' ? KATEGORI_GURU : KATEGORI_TU
                if (!list.includes(form.kategori)) set('kategori', list[0])
              }}
              className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
            >
              <option value="Guru">Guru</option>
              <option value="Tata Usaha">Tata Usaha</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kategori <span className="text-red-500">*</span>
            </label>
            <input
              list="kategori-options"
              value={form.kategori}
              onChange={(e) => set('kategori', e.target.value)}
              placeholder="Pilih atau ketik manual"
              required
              className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
            />
            <datalist id="kategori-options">
              {kategoriList.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Urutan tampil
          </label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => set('sort_order', Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Angka kecil tampil lebih dulu. Default 0 — saran: pakai pola
            10/20/30 supaya gampang nyisipin di tengah.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Foto profil
          </label>
          <div className="mt-2 flex items-start gap-4">
            <div className="h-24 w-24 flex-none overflow-hidden rounded-full border border-gray-200 bg-gray-50">
              {form.foto_url ? (
                <img
                  src={form.foto_url}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-gray-400">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Upload className="h-4 w-4" />
                {uploading ? 'Mengunggah…' : 'Unggah foto'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void onUpload(f)
                  }}
                />
              </label>
              <p className="text-xs text-gray-500">
                Atau tempel URL gambar:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={form.foto_url}
                  onChange={(e) => set('foto_url', e.target.value)}
                  placeholder="https://..."
                  className="block w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
                />
                {form.foto_url && (
                  <button
                    type="button"
                    onClick={() => set('foto_url', '')}
                    className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-700"
                    aria-label="Hapus URL foto"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
          <Link
            to="/admin/guru"
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}
