import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Container } from '../components/Container'
import { SectionHeader } from '../components/SectionHeader'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Category, Post, Tag } from '../types'

export function Berita() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [tagSlug, setTagSlug] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      const [postsRes, catsRes, tagsRes] = await Promise.all([
        supabase
          .from('posts')
          .select('*, category:categories(*), tags:post_tags(tag:tags(*))')
          .eq('status', 'published')
          .order('published_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('tags').select('*').order('name'),
      ])
      if (cancelled) return
      type PostWithTagJoin = Omit<Post, 'tags'> & {
        tags?: { tag: Tag }[]
      }
      const raw = (postsRes.data ?? []) as unknown as PostWithTagJoin[]
      const normalized: Post[] = raw.map((p) => ({
        ...p,
        tags: (p.tags ?? []).map((t) => t.tag).filter(Boolean) as Tag[],
      }))
      setPosts(normalized as Post[])
      setCategories((catsRes.data ?? []) as Category[])
      setTags((tagsRes.data ?? []) as Tag[])
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false
      if (categorySlug && p.category?.slug !== categorySlug) return false
      if (tagSlug && !p.tags?.some((t) => t.slug === tagSlug)) return false
      return true
    })
  }, [posts, q, categorySlug, tagSlug])

  return (
    <section className="py-20">
      <Container>
        <SectionHeader
          eyebrow="Berita"
          title="Semua Berita"
          subtitle="Kegiatan dan informasi terkini SMKN 19 Jakarta."
        />

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari berita…"
              className="w-full rounded-full border-gray-300 pl-9 text-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="rounded-full border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={tagSlug}
            onChange={(e) => setTagSlug(e.target.value)}
            className="rounded-full border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
          >
            <option value="">Semua Tag</option>
            {tags.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-2xl bg-gray-200"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-gray-500">
              {!isSupabaseConfigured ? (
                <>
                  Berita belum tersedia. Supabase belum dikonfigurasi.
                  <p className="mt-2 text-xs text-gray-400">
                    Salin <code>.env.example</code> menjadi{' '}
                    <code>.env.local</code>, lalu isi VITE_SUPABASE_URL dan
                    VITE_SUPABASE_ANON_KEY.
                  </p>
                </>
              ) : (
                'Belum ada berita yang cocok dengan filter.'
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <BeritaCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

function BeritaCard({ post }: { post: Post }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''
  return (
    <Link
      to={`/berita/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
    >
      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt={post.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700">
            <span className="font-display text-2xl font-bold">19</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {post.category?.name && (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {post.category.name}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold text-gray-900">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm text-gray-600">
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto pt-4 text-xs text-gray-500">{date}</div>
      </div>
    </Link>
  )
}
