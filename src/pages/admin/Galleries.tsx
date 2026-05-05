import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Image as ImageIcon, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { GalleryCollection } from '../../types'

type CollectionWithCount = GalleryCollection & { photo_count: number }

const CATEGORY_LABEL: Record<string, string> = {
  'humas-dudi': 'Humas/DUDI',
  kesiswaan: 'Kesiswaan',
  sarpras: 'Sarpras',
}

const CATEGORY_TONE: Record<string, string> = {
  'humas-dudi': 'bg-amber-50 text-amber-800 border-amber-200',
  kesiswaan: 'bg-teal-50 text-teal-800 border-teal-200',
  sarpras: 'bg-sky-50 text-sky-800 border-sky-200',
}

export function AdminGalleries() {
  const [rows, setRows] = useState<CollectionWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)

    const { data: cols, error: colErr } = await supabase
      .from('gallery_collections')
      .select('*')
      .order('sort_order', { ascending: true })

    if (colErr) {
      setError(colErr.message)
      setRows([])
      setLoading(false)
      return
    }

    const list = (cols ?? []) as GalleryCollection[]

    // Hitung jumlah foto per koleksi (fetch sekaligus)
    const { data: photos } = await supabase
      .from('gallery_photos')
      .select('collection_id')

    const counts = new Map<string, number>()
    for (const p of (photos ?? []) as { collection_id: string }[]) {
      counts.set(p.collection_id, (counts.get(p.collection_id) ?? 0) + 1)
    }

    setRows(
      list.map((c) => ({ ...c, photo_count: counts.get(c.id) ?? 0 })),
    )
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  // Group by category for nicer display
  const grouped = rows.reduce<Record<string, CollectionWithCount[]>>((acc, c) => {
    const key = c.category ?? 'lainnya'
    acc[key] = acc[key] ?? []
    acc[key].push(c)
    return acc
  }, {})

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Galeri Foto
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">
            Koleksi Galeri
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola foto untuk halaman publik —{' '}
            <span className="font-medium text-gray-700">
              {rows.length} koleksi
            </span>
            , total{' '}
            <span className="font-medium text-gray-700">
              {rows.reduce((a, c) => a + c.photo_count, 0)} foto
            </span>
            .
          </p>
        </div>
        <Link
          to="/admin/galleries/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Koleksi baru
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">
            Tabel <code className="rounded bg-amber-100 px-1">gallery_collections</code> belum tersedia.
          </p>
          <p className="mt-1">
            Jalankan migrasi{' '}
            <code className="rounded bg-amber-100 px-1">supabase/galleries.sql</code>{' '}
            di Supabase SQL Editor terlebih dahulu, lalu refresh halaman ini.
          </p>
          <p className="mt-2 text-xs text-amber-700">Detail: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-gray-50"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
          <h2 className="mt-4 font-display text-lg font-bold text-gray-900">
            Belum ada koleksi
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Buat koleksi baru, atau jalankan{' '}
            <code className="rounded bg-gray-100 px-1">supabase/galleries.sql</code>{' '}
            untuk seed otomatis 10 koleksi awal.
          </p>
          <Link
            to="/admin/galleries/new"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Buat koleksi
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {Object.entries(grouped).map(([cat, items]) => (
            <section key={cat}>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-gray-500">
                {CATEGORY_LABEL[cat] ?? 'Lainnya'}
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => (
                  <Link
                    key={c.id}
                    to={`/admin/galleries/${c.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
                      {c.cover_url ? (
                        <img
                          src={c.cover_url}
                          alt={c.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-300">
                          <ImageIcon className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-base font-bold text-gray-900">
                          {c.name}
                        </h3>
                        {c.category && (
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                              CATEGORY_TONE[c.category] ??
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            {CATEGORY_LABEL[c.category] ?? c.category}
                          </span>
                        )}
                      </div>
                      {c.description && (
                        <p className="line-clamp-2 text-xs text-gray-500">
                          {c.description}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                        <span>
                          <span className="font-semibold text-gray-800">
                            {c.photo_count}
                          </span>{' '}
                          foto
                        </span>
                        <span className="inline-flex items-center gap-1 text-brand-600 group-hover:gap-2">
                          Kelola <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
