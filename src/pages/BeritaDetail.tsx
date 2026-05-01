import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Tag as TagIcon } from 'lucide-react'
import { Container } from '../components/Container'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Post, Tag } from '../types'

export function BeritaDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    if (!isSupabaseConfigured) {
      setLoading(false)
      setError(
        'Supabase belum dikonfigurasi. Atur VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di .env.local.',
      )
      return
    }
    let cancelled = false
    async function load() {
      const { data, error: err } = await supabase
        .from('posts')
        .select('*, category:categories(*), tags:post_tags(tag:tags(*))')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()
      if (cancelled) return
      if (err) setError(err.message)
      else if (!data) setError('Berita tidak ditemukan.')
      else {
        const normalized = {
          ...data,
          tags: ((data.tags ?? []) as { tag: Tag }[])
            .map((t) => t.tag)
            .filter(Boolean) as Tag[],
        }
        setPost(normalized as Post)
      }
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <Container>
        <div className="py-20">
          <div className="h-10 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-gray-200" />
          <div className="mt-10 h-72 animate-pulse rounded-2xl bg-gray-200" />
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-4 w-full animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
        </div>
      </Container>
    )
  }

  if (error || !post) {
    return (
      <Container>
        <div className="py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Berita tidak ditemukan
          </h1>
          {error && <p className="mt-3 text-sm text-gray-500">{error}</p>}
          <Link
            to="/berita"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke daftar berita
          </Link>
        </div>
      </Container>
    )
  }

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <article className="py-12 sm:py-16">
      <Container size="narrow">
        <Link
          to="/berita"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke daftar berita
        </Link>
        {post.category?.name && (
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
            {post.category.name}
          </p>
        )}
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
          {date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {date}
            </span>
          )}
          {post.tags && post.tags.length > 0 && (
            <span className="inline-flex flex-wrap items-center gap-1.5">
              <TagIcon className="h-4 w-4" />
              {post.tags.map((t) => (
                <span
                  key={t.id}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                >
                  {t.name}
                </span>
              ))}
            </span>
          )}
        </div>
        {post.cover_url && (
          <div className="mt-8 overflow-hidden rounded-2xl">
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full object-cover"
            />
          </div>
        )}
        <div
          className="prose prose-lg prose-gray mt-10 max-w-none prose-headings:font-display prose-a:text-brand-600"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </Container>
    </article>
  )
}
