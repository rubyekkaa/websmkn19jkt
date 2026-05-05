import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageOff, Camera, ArrowRight } from 'lucide-react'
import { Container } from './Container'
import { PageHero } from './PageHero'
import { TONE_STYLES, type MenuItem } from '../data/menu'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { GalleryPhoto as DbGalleryPhoto } from '../types'

/**
 * Subset of the DB row that the public gallery actually renders.
 * Admin pages use the full {@link DbGalleryPhoto} type.
 */
export type GalleryPhoto = Pick<
  DbGalleryPhoto,
  'id' | 'image_url' | 'caption' | 'taken_at' | 'sort_order'
>

type Props = {
  /** Slug used to look up the gallery_collections row in PR B. */
  slug: string
  title: string
  subtitle?: string
  tone?: NonNullable<MenuItem['tone']>
  breadcrumbs?: { to?: string; label: string }[]
  /** Optional placeholder photos used until CMS is wired. */
  placeholder?: GalleryPhoto[]
}

export function GalleryPage({
  slug,
  title,
  subtitle,
  tone = 'gray',
  breadcrumbs,
  placeholder = [],
}: Props) {
  const t = TONE_STYLES[tone]
  const [photos, setPhotos] = useState<GalleryPhoto[]>(placeholder)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      // PR B introduces these tables. Until then this gracefully falls back to placeholder.
      const { data: col, error: colErr } = await supabase
        .from('gallery_collections')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
      if (cancelled) return
      if (colErr || !col) {
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('id, image_url, caption, taken_at, sort_order')
        .eq('collection_id', col.id)
        .order('sort_order', { ascending: true })
      if (cancelled) return
      if (!error && data && data.length > 0) {
        setPhotos(data as GalleryPhoto[])
      }
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [slug])

  return (
    <>
      <PageHero
        eyebrow="Galeri"
        title={title}
        subtitle={subtitle}
        tone={tone}
        breadcrumbs={breadcrumbs}
      />
      <section className="py-14 sm:py-20">
        <Container>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <EmptyState tone={tone} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setLightbox(p)}
                  className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border ${t.border} bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <img
                    src={p.image_url}
                    alt={p.caption ?? title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  {p.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="line-clamp-2 text-xs font-medium text-white">
                        {p.caption}
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </Container>
      </section>

      {lightbox && (
        <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  )
}

function EmptyState({ tone }: { tone: NonNullable<MenuItem['tone']> }) {
  const t = TONE_STYLES[tone]
  return (
    <div
      className={`mx-auto flex max-w-xl flex-col items-center rounded-2xl border-2 border-dashed ${t.border} ${t.bgSubtle} px-8 py-16 text-center`}
    >
      <div
        className={`grid h-14 w-14 place-items-center rounded-full bg-white ${t.text}`}
      >
        <Camera className="h-6 w-6" />
      </div>
      <h3 className={`mt-5 font-display text-xl font-bold ${t.text}`}>
        Foto akan segera hadir
      </h3>
      <p className={`mt-2 text-sm ${t.textSubtle}`}>
        Halaman galeri ini siap dikelola lewat panel admin. Foto bisa
        ditambah, diedit, dan diatur urutannya kapan saja.
      </p>
      <Link
        to="/admin"
        className={`mt-6 inline-flex items-center gap-1 text-sm font-semibold ${t.text} hover:underline`}
      >
        Buka panel admin <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function Lightbox({
  photo,
  onClose,
}: {
  photo: GalleryPhoto
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-black"
      >
        <img
          src={photo.image_url}
          alt={photo.caption ?? ''}
          className="max-h-[80vh] w-auto"
          onError={(e) => {
            const el = e.currentTarget
            el.outerHTML = `<div class="grid h-96 w-full place-items-center bg-gray-900 text-gray-400"><div class="flex flex-col items-center gap-2"><span>Gagal memuat gambar</span></div></div>`
            el.dispatchEvent(new Event('after-error'))
          }}
        />
        {photo.caption && (
          <div className="bg-black/80 p-4 text-center text-sm text-white">
            {photo.caption}
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-white/15 p-2 text-white backdrop-blur hover:bg-white/30"
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// Re-export icon for convenience
export { ImageOff }
