import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit2, ImageOff, Plus, Sparkles, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { cleanupBucketFiles } from '../../lib/bucketStorage'
import type { Ekskul } from '../../types'

const BUCKET = 'ekskul-photos'

export function AdminEkskul() {
  const [items, setItems] = useState<Ekskul[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('ekskul')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
    if (err) {
      setError(err.message)
      setItems([])
      setLoading(false)
      return
    }
    setItems((data ?? []) as Ekskul[])
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function onDelete(e: Ekskul) {
    if (!confirm(`Hapus ekskul "${e.name}"?`)) return
    const { error: err } = await supabase
      .from('ekskul')
      .delete()
      .eq('id', e.id)
    if (err) {
      alert(err.message)
      return
    }
    // Best-effort cleanup foto yang sebelumnya di-upload ke bucket
    // ekskul-photos. URL eksternal (mis. Unsplash) di-skip otomatis.
    await cleanupBucketFiles(BUCKET, e.image_url)
    void load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Kesiswaan
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">
            Ekstrakurikuler
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Total{' '}
            <span className="font-medium text-gray-700">{items.length}</span>{' '}
            ekskul. Tampil di /kesiswaan/ekstrakurikuler.
          </p>
        </div>
        <Link
          to="/admin/ekskul/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Tambah Ekskul
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">
            Tabel <code className="rounded bg-amber-100 px-1">ekskul</code>{' '}
            belum tersedia.
          </p>
          <p className="mt-1">
            Jalankan migrasi{' '}
            <code className="rounded bg-amber-100 px-1">
              supabase/ekskul-jurusan.sql
            </code>{' '}
            di Supabase SQL Editor terlebih dahulu, lalu refresh halaman ini.
          </p>
          <p className="mt-2 text-xs text-amber-700">Detail: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-gray-50"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-gray-400" />
          <h2 className="mt-4 font-display text-lg font-bold text-gray-900">
            Belum ada ekstrakurikuler
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Tambah ekskul yang ada di SMKN 19 — Paskibra, Pramuka, Futsal, dll.
          </p>
          <Link
            to="/admin/ekskul/new"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Tambah Ekskul
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Ekskul</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Jadwal</th>
                <th className="px-4 py-3 font-semibold">Pembina</th>
                <th className="px-4 py-3 font-semibold text-right">Urutan</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {e.image_url ? (
                        <img
                          src={e.image_url}
                          alt={e.name}
                          className="h-12 w-12 flex-none rounded-lg border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="grid h-12 w-12 flex-none place-items-center rounded-lg bg-teal-100 text-teal-700">
                          <ImageOff className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{e.name}</p>
                        <p className="text-xs text-gray-500">/{e.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {e.category ? (
                      <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                        {e.category}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {e.schedule || (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {e.pembina || (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {e.sort_order ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        to={`/admin/ekskul/${e.id}/edit`}
                        className="rounded-full p-2 text-gray-500 transition hover:bg-brand-50 hover:text-brand-700"
                        aria-label="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(e)}
                        className="rounded-full p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-700"
                        aria-label="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
