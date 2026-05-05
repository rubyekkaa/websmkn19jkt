import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { AgendaEvent } from '../../types'

const CATEGORIES = ['Ujian', 'Akademik', 'Libur', 'Kegiatan'] as const

export function AdminAgendaForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState<string>('Akademik')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (isNew) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('agenda_events')
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
        setError('Agenda tidak ditemukan.')
        setLoading(false)
        return
      }
      const ev = data as AgendaEvent
      setTitle(ev.title)
      setStartAt(ev.start_at)
      setEndAt(ev.end_at ?? '')
      setLocation(ev.location ?? '')
      setCategory(ev.category ?? 'Akademik')
      setDescription(ev.description ?? '')
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id, isNew])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (!title.trim()) throw new Error('Judul wajib diisi.')
      if (!startAt) throw new Error('Tanggal mulai wajib diisi.')
      if (endAt && endAt < startAt) {
        throw new Error('Tanggal selesai tidak boleh lebih awal dari mulai.')
      }

      const payload = {
        title: title.trim(),
        start_at: startAt,
        end_at: endAt || null,
        location: location.trim() || null,
        category: category || null,
        description: description.trim() || null,
        updated_at: new Date().toISOString(),
      }

      if (isNew) {
        const { error: err } = await supabase
          .from('agenda_events')
          .insert(payload)
        if (err) throw err
      } else {
        const { error: err } = await supabase
          .from('agenda_events')
          .update(payload)
          .eq('id', id)
        if (err) throw err
      }
      navigate('/admin/agenda')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!id) return
    if (!confirm('Hapus agenda ini?')) return
    const { error: err } = await supabase
      .from('agenda_events')
      .delete()
      .eq('id', id)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/admin/agenda')
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/admin/agenda"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar agenda
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-gray-900">
        {isNew ? 'Tambah agenda' : 'Edit agenda'}
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
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pekan UTS Semester Ganjil"
              required
              className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tanggal mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tanggal selesai
              </label>
              <input
                type="date"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Kosongkan untuk acara 1 hari saja.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Lokasi
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Aula, Kelas, dst."
                className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
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
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detail acara — peserta, agenda, pakaian, dll."
              className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
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
