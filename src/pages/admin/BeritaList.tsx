import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type Row = {
  id: string
  title: string
  slug: string
  status: string
  updated_at: string
  category: { name: string } | null
}

export function AdminBeritaList() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  async function load() {
    setLoading(true)
    let q = supabase
      .from('posts')
      .select('id, title, slug, status, updated_at, category:categories(name)')
      .order('updated_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setRows(((data ?? []) as unknown) as Row[])
    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function onDelete(id: string) {
    if (!confirm('Yakin hapus berita ini? Tidak bisa dibatalkan.')) return
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) {
      alert(`Gagal menghapus: ${error.message}`)
      return
    }
    void load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Konten
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">
            Berita
          </h1>
        </div>
        <Link
          to="/admin/berita/baru"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Berita Baru
        </Link>
      </div>

      <div className="mt-6 inline-flex rounded-full border border-gray-200 bg-white p-1 text-sm">
        {(['all', 'published', 'draft'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 font-medium transition ${
              filter === f
                ? 'bg-brand-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {f === 'all' ? 'Semua' : f === 'published' ? 'Terbit' : 'Draft'}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Memuat…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Belum ada berita.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3">Judul</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Diperbarui</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {r.title}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {r.category?.name ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === 'published'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {r.status === 'published' ? 'Terbit' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(r.updated_at).toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {r.status === 'published' && (
                        <Link
                          to={`/berita/${r.slug}`}
                          target="_blank"
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          aria-label="Lihat"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <Link
                        to={`/admin/berita/${r.id}/edit`}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        aria-label="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(r.id)}
                        className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-700"
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
        )}
      </div>
    </div>
  )
}
