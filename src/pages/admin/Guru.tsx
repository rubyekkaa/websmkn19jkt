import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, Plus, Search, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Teacher, TeacherGrup } from '../../types'

export function AdminGuru() {
  const [rows, setRows] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [grupFilter, setGrupFilter] = useState<'all' | TeacherGrup>('all')
  const [q, setQ] = useState('')

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('teachers')
      .select('*')
      .order('grup', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
    if (err) {
      setError(err.message)
      setRows([])
    } else {
      setRows((data ?? []) as Teacher[])
    }
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchG = grupFilter === 'all' || r.grup === grupFilter
      const matchQ =
        !q ||
        r.name.toLowerCase().includes(q.toLowerCase()) ||
        r.jabatan.toLowerCase().includes(q.toLowerCase()) ||
        r.kategori.toLowerCase().includes(q.toLowerCase())
      return matchG && matchQ
    })
  }, [rows, grupFilter, q])

  const totalGuru = useMemo(
    () => rows.filter((r) => r.grup === 'Guru').length,
    [rows],
  )
  const totalTU = useMemo(
    () => rows.filter((r) => r.grup === 'Tata Usaha').length,
    [rows],
  )

  async function onDelete(t: Teacher) {
    if (!confirm(`Hapus "${t.name}"? Tidak bisa dibatalkan.`)) return
    const { error: err } = await supabase
      .from('teachers')
      .delete()
      .eq('id', t.id)
    if (err) {
      alert(`Gagal menghapus: ${err.message}`)
      return
    }
    if (t.foto_url) {
      // Coba hapus juga foto-nya dari storage (best-effort)
      const path = extractStoragePath(t.foto_url)
      if (path) {
        await supabase.storage.from('teacher-photos').remove([path])
      }
    }
    void load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Profil Sekolah
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">
            Tenaga Pendidik & Kependidikan
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Total: <span className="font-semibold text-gray-800">{rows.length}</span>{' '}
            orang ({totalGuru} Guru, {totalTU} Tata Usaha)
          </p>
        </div>
        <Link
          to="/admin/guru/baru"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Tambah
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama / jabatan / kategori…"
            className="w-full rounded-full border-gray-300 pl-9 text-sm focus:border-brand-500 focus:ring-brand-500"
          />
        </div>
        <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 text-sm">
          {(['all', 'Guru', 'Tata Usaha'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setGrupFilter(f)}
              className={`rounded-full px-3 py-1 font-medium transition ${
                grupFilter === f
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {f === 'all' ? 'Semua' : f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Tabel teachers belum tersedia.</p>
          <p className="mt-1">
            Jalankan migrasi <code className="rounded bg-amber-100 px-1">supabase/teachers.sql</code>{' '}
            di Supabase SQL Editor terlebih dahulu, lalu refresh halaman ini.
          </p>
          <p className="mt-2 text-xs text-amber-700">Detail: {error}</p>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Memuat…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            {rows.length === 0
              ? 'Belum ada data. Klik "Tambah" untuk membuat entri pertama.'
              : 'Tidak ada hasil untuk filter Anda.'}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">Jabatan</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Grup</th>
                <th className="px-5 py-3">Urutan</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {r.foto_url ? (
                        <img
                          src={r.foto_url}
                          alt={r.name}
                          className="h-9 w-9 flex-none rounded-full object-cover"
                        />
                      ) : (
                        <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-brand-50 text-brand-700">
                          <span className="text-xs font-semibold">
                            {r.name
                              .split(' ')
                              .map((s) => s[0])
                              .slice(0, 2)
                              .join('')}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{r.jabatan}</td>
                  <td className="px-5 py-3 text-gray-600">{r.kategori}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.grup === 'Guru'
                          ? 'bg-brand-50 text-brand-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {r.grup}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{r.sort_order}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        to={`/admin/guru/${r.id}/edit`}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        aria-label="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(r)}
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

function extractStoragePath(publicUrl: string): string | null {
  // Pola URL: https://<proj>.supabase.co/storage/v1/object/public/teacher-photos/<path>
  const marker = '/storage/v1/object/public/teacher-photos/'
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return publicUrl.slice(idx + marker.length)
}
