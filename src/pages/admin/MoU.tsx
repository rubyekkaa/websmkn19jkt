import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Edit2,
  ExternalLink,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { MoUPartner } from '../../types'

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function AdminMoU() {
  const [items, setItems] = useState<MoUPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('mou_partners')
      .select('*')
      .order('signed_at', { ascending: false })
    if (err) {
      setError(err.message)
      setItems([])
      setLoading(false)
      return
    }
    setItems((data ?? []) as MoUPartner[])
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function onDelete(m: MoUPartner) {
    if (!confirm(`Hapus MoU "${m.partner_name}"?`)) return
    const { error: err } = await supabase
      .from('mou_partners')
      .delete()
      .eq('id', m.id)
    if (err) {
      alert(err.message)
      return
    }
    void load()
  }

  const counts = useMemo(() => {
    const c = { aktif: 0, berakhir: 0 }
    for (const m of items) {
      if (m.status === 'berakhir') c.berakhir++
      else c.aktif++
    }
    return c
  }, [items])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Humas / DUDI
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">
            MoU & Kerja Sama Industri
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Total{' '}
            <span className="font-medium text-gray-700">{items.length}</span>{' '}
            MoU · {counts.aktif} aktif · {counts.berakhir} berakhir
          </p>
        </div>
        <Link
          to="/admin/mou/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Tambah MoU
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">
            Tabel{' '}
            <code className="rounded bg-amber-100 px-1">mou_partners</code>{' '}
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
          <FileText className="mx-auto h-10 w-10 text-gray-400" />
          <h2 className="mt-4 font-display text-lg font-bold text-gray-900">
            Belum ada MoU
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Tambah mitra industri yang sudah menandatangani MoU dengan SMKN 19.
          </p>
          <Link
            to="/admin/mou/new"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Tambah MoU
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Mitra</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Dokumen</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {m.partner_logo_url ? (
                        <img
                          src={m.partner_logo_url}
                          alt={m.partner_name}
                          className="h-10 w-10 rounded-lg border border-gray-200 object-contain"
                        />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-700">
                          <Building2 className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {m.partner_name}
                        </p>
                        {m.description && (
                          <p className="line-clamp-1 max-w-md text-xs text-gray-500">
                            {m.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div>{fmt(m.signed_at)}</div>
                    <div className="text-xs text-gray-500">
                      s.d. {fmt(m.expires_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        m.status === 'berakhir'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {m.status ?? 'aktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {m.document_url ? (
                      <a
                        href={m.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                      >
                        Lihat <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        to={`/admin/mou/${m.id}/edit`}
                        className="rounded-full p-2 text-gray-500 transition hover:bg-brand-50 hover:text-brand-700"
                        aria-label="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(m)}
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
