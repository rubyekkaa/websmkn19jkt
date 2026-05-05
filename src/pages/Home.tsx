import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  GraduationCap,
  Sparkles,
  Users,
  BookOpen,
  Calendar,
  Handshake,
  Building2,
  Trophy,
  Award,
  FlaskConical,
  Camera,
  Newspaper,
} from 'lucide-react'
import { Container } from '../components/Container'
import { JURUSAN } from '../data/jurusan'
import { EKSKUL } from '../data/ekskul'
import { TONE_STYLES } from '../data/menu'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Post } from '../types'

const HERO = {
  title: 'SMKN 19 Jakarta',
  subtitle:
    'Sekolah Berkarakter & Berprestasi — Mencetak generasi siap kerja dan berwirausaha.',
  image: '/images/1.jpg',
}

export function Home() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)

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
          <img
            src={HERO.image}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-950/55 to-gray-950/30" />
        </div>
        <Container>
          <div className="grid gap-10 py-24 md:py-36 lg:grid-cols-2 lg:py-44">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Penerimaan murid baru terbuka
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                {HERO.title}
              </h1>
              <p className="mt-5 text-lg text-gray-200">
                {HERO.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/kurikulum/jurusan"
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
        </Container>
      </section>

      {/* Stats */}
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

      {/* === Section card: Berita (gray) === */}
      <SoftSection
        tone="gray"
        eyebrow="Berita"
        title="Kabar Terbaru"
        subtitle="Kegiatan dan informasi terkini SMKN 19 Jakarta."
        ctaTo="/berita"
        ctaLabel="Lihat Semua Berita"
      >
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
            <Newspaper className="mx-auto mb-3 h-10 w-10 text-gray-300" />
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
      </SoftSection>

      {/* === Section card: Kurikulum (purple) === */}
      <SoftSection
        tone="purple"
        eyebrow="Kurikulum"
        title="Program Keahlian & Agenda Akademik"
        subtitle="Empat jurusan unggulan berbasis link & match dengan dunia industri, plus agenda akademik yang terstruktur."
        ctaTo="/kurikulum"
        ctaLabel="Lihat Kurikulum"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {JURUSAN.map((j) => (
            <Link
              key={j.slug}
              to={`/kurikulum/jurusan/${j.slug}`}
              className="group overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
            >
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={j.image}
                  alt={j.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-700">
                  {j.short}
                </p>
                <h3 className="mt-1 font-display text-sm font-semibold text-gray-900">
                  {j.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FeatureLink
            tone="purple"
            to="/kurikulum/jurusan"
            icon={BookOpen}
            title="Detail Jurusan"
            desc="Kompetensi tiap program keahlian"
          />
          <FeatureLink
            tone="purple"
            to="/kurikulum/agenda"
            icon={Calendar}
            title="Agenda Akademik"
            desc="Kalender pendidikan dan jadwal ujian"
          />
        </div>
      </SoftSection>

      {/* === Section card: Humas/DUDI (amber) === */}
      <SoftSection
        tone="amber"
        eyebrow="Humas / DUDI"
        title="Kerja Sama dengan Dunia Industri"
        subtitle="Magang, kelas industri, dan kunjungan langsung ke perusahaan mitra membentuk lulusan yang siap kerja."
        ctaTo="/humas-dudi"
        ctaLabel="Lihat Humas/DUDI"
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <FeatureCard
            tone="amber"
            to="/humas-dudi/mou"
            icon={Handshake}
            title="MoU & Kerja Sama"
            desc="Daftar perusahaan mitra industri yang telah bekerja sama dengan kami."
          />
          <FeatureCard
            tone="amber"
            to="/humas-dudi/kunjungan-industri"
            icon={Building2}
            title="Kunjungan Industri"
            desc="Galeri kunjungan siswa ke perusahaan partner — belajar dari praktisi."
          />
          <FeatureCard
            tone="amber"
            to="/humas-dudi/kelas-industri"
            icon={GraduationCap}
            title="Kelas Industri"
            desc="Galeri kelas dengan guru tamu praktisi industri & workshop."
          />
        </div>
      </SoftSection>

      {/* === Section card: Kesiswaan (teal) === */}
      <SoftSection
        tone="teal"
        eyebrow="Kesiswaan"
        title="Pengembangan Karakter & Bakat"
        subtitle="Wadah siswa mengasah minat, bakat, dan karakter melalui ekstrakurikuler dan kegiatan rutin sekolah."
        ctaTo="/kesiswaan"
        ctaLabel="Lihat Kesiswaan"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EKSKUL.slice(0, 8).map((e) => (
            <div
              key={e.slug}
              className="overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100">
                <img
                  src={e.image}
                  alt={e.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="font-display text-sm font-semibold text-gray-900">
                  {e.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <FeatureLink
            tone="teal"
            to="/kesiswaan/ekstrakurikuler"
            icon={Trophy}
            title="Ekstrakurikuler"
            desc="8+ ekskul minat & bakat"
          />
          <FeatureLink
            tone="teal"
            to="/kesiswaan/kegiatan-rutin"
            icon={Sparkles}
            title="Kegiatan Rutin"
            desc="Galeri acara siswa SMKN 19"
          />
          <FeatureLink
            tone="teal"
            to="/kesiswaan/prestasi"
            icon={Award}
            title="Prestasi"
            desc="Galeri kejuaraan & capaian siswa"
          />
        </div>
      </SoftSection>

      {/* === Section card: Sarpras (sky) === */}
      <SoftSection
        tone="sky"
        eyebrow="Sarpras"
        title="Fasilitas Belajar & Teaching Factory"
        subtitle="Dari laboratorium komputer sampai teaching factory — fasilitas modern mendukung praktik nyata di tiap jurusan."
        ctaTo="/sarpras"
        ctaLabel="Lihat Semua Fasilitas"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/sarpras/lab', icon: FlaskConical, title: 'Laboratorium' },
            { to: '/sarpras/kelas', icon: BookOpen, title: 'Ruang Kelas' },
            { to: '/sarpras/studio', icon: Camera, title: 'Studio' },
            {
              to: '/sarpras/tefa-perfilman',
              icon: Sparkles,
              title: 'TeFa Perfilman',
            },
            {
              to: '/sarpras/tefa-perkantoran',
              icon: Building2,
              title: 'TeFa Perkantoran',
            },
            {
              to: '/sarpras/tefa-bisnis-retail',
              icon: Trophy,
              title: 'TeFa Bisnis Retail',
            },
            {
              to: '/sarpras/tefa-akuntansi',
              icon: GraduationCap,
              title: 'TeFa Akuntansi',
            },
          ].map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-sky-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-sky-700">
                <s.icon className="h-5 w-5" />
              </span>
              <p className="font-display text-sm font-semibold text-gray-900">
                {s.title}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700">
                Galeri{' '}
                <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </SoftSection>

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

// === Reusable section card with soft pastel background ===

type Tone = keyof typeof TONE_STYLES

function SoftSection({
  tone,
  eyebrow,
  title,
  subtitle,
  ctaTo,
  ctaLabel,
  children,
}: {
  tone: Tone
  eyebrow: string
  title: string
  subtitle?: string
  ctaTo: string
  ctaLabel: string
  children: React.ReactNode
}) {
  const t = TONE_STYLES[tone]
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div
          className={`relative overflow-hidden rounded-3xl border ${t.border} ${t.bg} p-7 shadow-sm sm:p-10`}
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-20 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
          <div className="relative">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.18em] ${t.textSubtle}`}
                >
                  {eyebrow}
                </p>
                <h2
                  className={`mt-2 font-display text-2xl font-bold sm:text-3xl ${t.text}`}
                >
                  {title}
                </h2>
                {subtitle && (
                  <p
                    className={`mt-2 text-sm sm:text-base ${t.textSubtle}`}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
              <Link
                to={ctaTo}
                className={`inline-flex flex-none items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold ${t.accent} transition`}
              >
                {ctaLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </Container>
    </section>
  )
}

function FeatureCard({
  tone,
  to,
  icon: Icon,
  title,
  desc,
}: {
  tone: Tone
  to: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
}) {
  const t = TONE_STYLES[tone]
  return (
    <Link
      to={to}
      className={`group block rounded-2xl border ${t.border} bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <span
        className={`grid h-11 w-11 place-items-center rounded-xl ${t.chip}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-display text-base font-semibold text-gray-900">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-600">{desc}</p>
      <span
        className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${t.text}`}
      >
        Selengkapnya{' '}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

function FeatureLink({
  tone,
  to,
  icon: Icon,
  title,
  desc,
}: {
  tone: Tone
  to: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
}) {
  const t = TONE_STYLES[tone]
  return (
    <Link
      to={to}
      className={`group flex items-center gap-4 rounded-2xl border ${t.border} bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <span className={`grid h-11 w-11 flex-none place-items-center rounded-xl ${t.chip}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="font-display text-sm font-semibold text-gray-900">
          {title}
        </p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <ArrowRight
        className={`h-4 w-4 ${t.textSubtle} transition group-hover:translate-x-0.5`}
      />
    </Link>
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
