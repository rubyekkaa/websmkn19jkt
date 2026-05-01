import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, FileText, FolderClosed, Hash, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type Counts = {
  posts: number
  published: number
  draft: number
  categories: number
  tags: number
}

export function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null)
  const [recent, setRecent] = useState<
    {
      id: string
      title: string
      slug: string
      status: string
      updated_at: string
    }[]
  >([])

  useEffect(() => {
    async function load() {
      const [postsAll, postsPub, postsDraft, cats, tags, recentRows] =
        await Promise.all([
          supabase.from('posts').select('*', { count: 'exact', head: true }),
          supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published'),
          supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'draft'),
          supabase
            .from('categories')
            .select('*', { count: 'exact', head: true }),
          supabase.from('tags').select('*', { count: 'exact', head: true }),
          supabase
            .from('posts')
            .select('id, title, slug, status, updated_at')
            .order('updated_at', { ascending: false })
            .limit(5),
        ])
      setCounts({
        posts: postsAll.count ?? 0,
        published: postsPub.count ?? 0,
        draft: postsDraft.count ?? 0,
        categories: cats.count ?? 0,
        tags: tags.count ?? 0,
      })
      setRecent(recentRows.data ?? [])
    }
    void load()
  }, [])

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Admin
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
        </div>
        <Link
          to="/admin/berita/baru"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Berita Baru
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Total Berita"
          value={counts?.posts ?? '…'}
          sub={`${counts?.published ?? 0} terbit · ${counts?.draft ?? 0} draft`}
        />
        <StatCard
          icon={FileText}
          label="Terbit"
          value={counts?.published ?? '…'}
          sub="Tampil di website"
        />
        <StatCard
          icon={FolderClosed}
          label="Kategori"
          value={counts?.categories ?? '…'}
          sub="Pengelompok berita"
        />
        <StatCard
          icon={Hash}
          label="Tag"
          value={counts?.tags ?? '…'}
          sub="Label tambahan"
        />
      </div>

      <div className="mt-10 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-display font-semibold text-gray-900">
            Berita Terbaru
          </h2>
          <Link
            to="/admin/berita"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Lihat semua
          </Link>
        </div>
        <ul className="divide-y divide-gray-100">
          {recent.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-gray-500">
              Belum ada berita. Klik <strong>Berita Baru</strong> untuk
              menambahkan.
            </li>
          )}
          {recent.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-4 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {p.title}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(p.updated_at).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.status === 'published'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {p.status === 'published' ? 'Terbit' : 'Draft'}
                </span>
                <Link
                  to={`/admin/berita/${p.id}/edit`}
                  className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Edit"
                >
                  <Edit3 className="h-4 w-4" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof FileText
  label: string
  value: number | string
  sub?: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          {label}
        </p>
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-gray-900">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  )
}
