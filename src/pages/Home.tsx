import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap, Sparkles, Users } from 'lucide-react'
import { Container } from '../components/Container'
import { SectionHeader } from '../components/SectionHeader'
import { JURUSAN } from '../data/jurusan'
import { EKSKUL } from '../data/ekskul'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Post } from '../types'

const SLIDES = [
  {
    title: 'SMKN 19 Jakarta',
    subtitle:
      'Sekolah Berkarakter & Berprestasi — Mencetak generasi siap kerja dan berwirausaha.',
    image: '/images/1.jpg',
  },
  {
    title: 'Belajar dari Industri',
    subtitle:
      'Kurikulum link & match dengan dunia industri, didukung praktik langsung di laboratorium modern.',
    image: '/images/2.jpg',
  },
  {
    title: 'Karakter, Iman, & Prestasi',
    subtitle:
      'Membangun siswa yang bertaqwa, cerdas, terampil, dan berwawasan lingkungan.',
    image: '/images/3.jpg',
  },
]

export function Home() {
  const [slide, setSlide] = useState(0)
  const [latestPosts, setLatestPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)

  useEffect(() => {
    const id = setInterval(
      () => setSlide((s) => (s + 1) % SLIDES.length),
      6000,
    )
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setPostsLoading(false)
      return
    }
    let cancelled = false
    void supabase
      .from('posts')
      .select('*, category:categories(*)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) setLatestPosts(data as Post[])
        setPostsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {SLIDES.map((s, i) => (
            <div
              key={s.title}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === slide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={s.image}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-950/55 to-gray-950/30" />
            </div>
          ))}
        </div>
        <Container>
          <div className="grid gap-10 py-24 md:py-36 lg:grid-cols-2 lg:py-44">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Penerimaan murid baru terbuka
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                {SLIDES[slide].title}
              </h1>
              <p className="mt-5 text-lg text-gray-200">
                {SLIDES[slide].subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/jurusan"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/30 transition hover:bg-brand-400"
                >
                  Lihat Jurusan
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/profil"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Tentang Sekolah
                </Link>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-2 pb-12 lg:absolute lg:bottom-12 lg:left-1/2 lg:-translate-x-1/2 lg:pb-0">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? 'w-8 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Stats / quick value */}
      <section className="border-b border-gray-100 bg-white">
        <Container>
          <div className="grid gap-8 py-12 sm:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                title: '4 Program Keahlian',
                desc: 'Produksi Film, AKL, MPLB, Bisnis Retail.',
              },
              {
                icon: Users,
                title: '50+ Tenaga Pengajar',
                desc: 'Guru kompeten dan tenaga kependidikan profesional.',
              },
              {
                icon: Sparkles,
                title: '8+ Ekstrakurikuler',
                desc: 'Mengasah minat, bakat, dan karakter siswa.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display font-semibold text-gray-900">
                    {title}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Berita */}
      <section className="bg-gray-50 py-20">
        <Container>
          <SectionHeader
            eyebrow="Berita"
            title="Kabar Terbaru"
            subtitle="Kegiatan dan informasi terkini SMKN 19 Jakarta."
          />
          <div className="mt-10">
            {postsLoading ? (
              <div className="grid gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-72 animate-pulse rounded-2xl bg-gray-200"
                  />
                ))}
              </div>
            ) : latestPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-gray-500">
                Belum ada berita yang dipublikasikan.
                {!isSupabaseConfigured && (
                  <span className="mt-2 block text-xs text-gray-400">
                    (Supabase belum dikonfigurasi — atur di file{' '}
                    <code>.env.local</code>)
                  </span>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {latestPosts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            )}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              to="/berita"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:border-brand-500 hover:text-brand-600"
            >
              Lihat semua berita <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Jurusan */}
      <section className="py-20">
        <Container>
          <SectionHeader
            eyebrow="Jurusan"
            title="Program Keahlian"
            subtitle="Kenali jurusan dan kompetensi unggulan kami."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {JURUSAN.map((j) => (
              <Link
                key={j.slug}
                to={`/jurusan/${j.slug}`}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={j.image}
                    alt={j.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                    {j.short}
                  </p>
                  <h3 className="mt-1 font-display text-base font-semibold text-gray-900">
                    {j.name}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                    Baca selengkapnya <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Ekstrakurikuler */}
      <section className="bg-gray-50 py-20">
        <Container>
          <SectionHeader
            eyebrow="Ekstrakurikuler"
            title="Kegiatan Pengembangan Diri"
            subtitle="Wadah siswa mengasah minat dan bakat."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EKSKUL.slice(0, 6).map((e) => (
              <div
                key={e.slug}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100">
                  <img
                    src={e.image}
                    alt={e.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base font-semibold text-gray-900">
                    {e.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{e.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              to="/ekstrakurikuler"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:border-brand-500 hover:text-brand-600"
            >
              Lihat semua ekstrakurikuler{' '}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20">
        <Container>
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-10 text-white shadow-xl sm:p-14">
            <div className="grid items-center gap-6 md:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl font-bold sm:text-4xl">
                  Punya pertanyaan tentang pendaftaran?
                </h2>
                <p className="mt-3 text-brand-50/90">
                  Tim kami siap membantu Anda. Hubungi kami atau kunjungi
                  langsung sekolah.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link
                  to="/kontak"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  Hubungi Kami <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="mailto:smkn19jkt@gmail.com"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Email Kami
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

function PostCard({ post }: { post: Post }) {
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
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
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
          <div className="grid h-full place-items-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-600">
            <Sparkles className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="p-5">
        {post.category?.name && (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {post.category.name}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold text-gray-900">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
            {post.excerpt}
          </p>
        )}
        <p className="mt-3 text-xs text-gray-500">{date}</p>
      </div>
    </Link>
  )
}
