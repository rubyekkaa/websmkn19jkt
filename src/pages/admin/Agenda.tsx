import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Edit2,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { AgendaEvent } from '../../types'

const CATEGORY_TONE: Record<string, string> = {
  Ujian: 'bg-red-100 text-red-700',
  Akademik: 'bg-blue-100 text-blue-700',
  Libur: 'bg-emerald-100 text-emerald-700',
  Kegiatan: 'bg-amber-100 text-amber-700',
}

function fmt(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function fmtRange(start: string, end: string | null) {
  if (!end || end === start) return fmt(start)
  return `${fmt(start)} – ${fmt(end)}`
}

export function AdminAgenda() {
  const [items, setItems] = useState<AgendaEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('agenda_events')
      .select('*')
      .order('start_at', { ascending: true })
    if (err) {
      setError(err.message)
      setItems([])
      setLoading(false)
      return
    }
    setItems((data ?? []) as AgendaEvent[])
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function onDelete(ev: AgendaEvent) {
    if (!confirm(`Hapus agenda "${ev.title}"?`)) return
    const { error: err } = await supabase
      .from('agenda_events')
      .delete()
      .eq('id', ev.id)
    if (err) {
      alert(err.message)
      return
    }
    void load()
  }

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const it of items) {
      if (it.category) set.add(it.category)
    }
    return Array.from(set).sort()
  }, [items])

  const filtered = useMemo(() => {
    if (filterCategory === 'all') return items
    return items.filter((i) => i.category === filterCategory)
  }, [items, filterCategory])

  // Group by month for nicer display
  const grouped = useMemo(() => {
    const out: Record<string, AgendaEvent[]> = {}
    for (const ev of filtered) {
      const d = new Date(ev.start_at)
      const key = d.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      })
      out[key] = out[key] ?? []
      out[key].push(ev)
    }
    return out
  }, [filtered])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Kurikulum
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">
            Agenda Akademik
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Total{' '}
            <span className="font-medium text-gray-700">{items.length}</span>{' '}
            agenda · {categories.length} kategori
          </p>
        </div>
        <Link
          to="/admin/agenda/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Tambah agenda
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">
            Tabel{' '}
            <code className="rounded bg-amber-100 px-1">agenda_events</code>{' '}
            belum tersedia.
          </p>
          <p className="mt-1">
            Jalankan migrasi{' '}
            <code className="rounded bg-amber-100 px-1">
              supabase/mou-agenda.sql
            </code>{' '}
            di Supabase SQL Editor terlebih dahulu, lalu refresh halaman ini.
          </p>
          <p className="mt-2 text-xs text-amber-700">Detail: {error}</p>
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              filterCategory === 'all'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCategory(c)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                filterCategory === c
                  ? 'bg-brand-600 text-white'
                  : (CATEGORY_TONE[c] ?? 'bg-gray-100 text-gray-700') +
                    ' hover:opacity-80'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-gray-200 bg-gray-50"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <Calendar className="mx-auto h-10 w-10 text-gray-400" />
          <h2 className="mt-4 font-display text-lg font-bold text-gray-900">
            {items.length === 0
              ? 'Belum ada agenda'
              : 'Tidak ada agenda di kategori ini'}
          </h2>
          {items.length === 0 && (
            <>
              <p className="mt-1 text-sm text-gray-500">
                Tambah jadwal UTS, UAS, libur, atau kegiatan akademik lain.
              </p>
              <Link
                to="/admin/agenda/new"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                <Plus className="h-4 w-4" /> Tambah agenda
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {Object.entries(grouped).map(([month, list]) => (
            <section key={month}>
              <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-gray-500">
                {month}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <ul className="divide-y divide-gray-100">
                  {list.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex flex-wrap items-start gap-3 px-4 py-3 hover:bg-gray-50 sm:flex-nowrap"
                    >
                      <div className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-purple-50 text-purple-700">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {ev.category && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                CATEGORY_TONE[ev.category] ??
                                'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {ev.category}
                            </span>
                          )}
                          <h3 className="font-semibold text-gray-900">
                            {ev.title}
                          </h3>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {fmtRange(ev.start_at, ev.end_at)}
                          {ev.location && (
                            <span className="inline-flex items-center gap-1 pl-2">
                              <MapPin className="h-3 w-3" /> {ev.location}
                            </span>
                          )}
                        </p>
                        {ev.description && (
                          <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                            {ev.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-none items-center gap-1">
                        <Link
                          to={`/admin/agenda/${ev.id}/edit`}
                          className="rounded-full p-2 text-gray-500 transition hover:bg-brand-50 hover:text-brand-700"
                          aria-label="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(ev)}
                          className="rounded-full p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-700"
                          aria-label="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
