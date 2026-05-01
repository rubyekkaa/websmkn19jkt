import { useEffect, useMemo, useState } from 'react'
import { Search, ShieldCheck, ShieldOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import type { Profile, UserRole } from '../../types'

export function AdminUsers() {
  const { user, refreshProfile } = useAuth()
  const [rows, setRows] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [q, setQ] = useState('')

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (err) {
      setError(err.message)
      setRows([])
    } else {
      setRows((data ?? []) as Profile[])
    }
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    if (!q) return rows
    const needle = q.toLowerCase()
    return rows.filter(
      (r) =>
        r.email?.toLowerCase().includes(needle) ||
        r.full_name?.toLowerCase().includes(needle),
    )
  }, [rows, q])

  async function changeRole(p: Profile, newRole: UserRole) {
    if (newRole === p.role) return
    if (p.id === user?.id && newRole === 'editor') {
      if (
        !confirm(
          'Anda akan menurunkan role Anda sendiri menjadi editor — Anda akan kehilangan akses ke menu Admin (Guru/TU dan Pengguna). Lanjutkan?',
        )
      )
        return
    }
    setSavingId(p.id)
    setError(null)
    const { error: err } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', p.id)
    setSavingId(null)
    if (err) {
      setError(err.message)
      return
    }
    if (p.id === user?.id) {
      await refreshProfile()
    }
    void load()
  }

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Sistem
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">
          Kelola Pengguna
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Atur role pengguna admin panel.{' '}
          <strong>Admin</strong> punya akses penuh; <strong>Editor</strong>{' '}
          hanya bisa kelola Berita, Kategori, dan Tag.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari email / nama…"
            className="w-full rounded-full border-gray-300 pl-9 text-sm focus:border-brand-500 focus:ring-brand-500"
          />
        </div>
        <span className="text-sm text-gray-500">
          {filtered.length} dari {rows.length}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        <p>
          <strong>Cara menambah pengguna baru:</strong> buka{' '}
          <a
            href="https://supabase.com/dashboard/project/_/auth/users"
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 underline hover:no-underline"
          >
            Supabase Dashboard → Authentication → Users
          </a>{' '}
          → klik <em>Add user</em> → isi email + password, centang{' '}
          <em>Auto Confirm User</em>. User baru akan otomatis tampil di daftar
          ini dengan role default <strong>editor</strong>. Anda bisa promote
          jadi admin di halaman ini.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Gagal memuat / menyimpan data.</p>
          <p className="mt-1 text-xs">Detail: {error}</p>
          <p className="mt-2 text-xs text-red-700">
            Pastikan migrasi <code className="rounded bg-red-100 px-1">supabase/roles.sql</code>{' '}
            sudah dijalankan di Supabase SQL Editor.
          </p>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Memuat…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            {rows.length === 0
              ? 'Belum ada user terdaftar.'
              : 'Tidak ada hasil untuk pencarian Anda.'}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Bergabung</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => {
                const isSelf = p.id === user?.id
                return (
                  <tr key={p.id}>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {p.email ?? '—'}
                      {isSelf && (
                        <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-700">
                          Anda
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {p.full_name ?? '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.role === 'admin'
                            ? 'bg-brand-50 text-brand-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {p.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(p.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {p.role === 'admin' ? (
                        <button
                          type="button"
                          disabled={savingId === p.id}
                          onClick={() => void changeRole(p, 'editor')}
                          className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                        >
                          <ShieldOff className="h-3.5 w-3.5" />
                          {savingId === p.id ? 'Menyimpan…' : 'Jadikan Editor'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={savingId === p.id}
                          onClick={() => void changeRole(p, 'admin')}
                          className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {savingId === p.id ? 'Menyimpan…' : 'Jadikan Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
