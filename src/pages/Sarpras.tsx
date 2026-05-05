import { Link } from 'react-router-dom'
import {
  ArrowRight,
  FlaskConical,
  Presentation,
  Camera,
  Film,
  Briefcase,
  ShoppingBag,
  Calculator,
} from 'lucide-react'
import { Container } from '../components/Container'
import { PageHero } from '../components/PageHero'
import { TONE_STYLES } from '../data/menu'

const TONE = 'sky' as const

export const SARPRAS_ITEMS = [
  {
    to: '/sarpras/lab',
    slug: 'lab',
    icon: FlaskConical,
    title: 'Laboratorium',
    desc: 'Lab komputer, multimedia, dan praktik dengan perangkat lengkap.',
  },
  {
    to: '/sarpras/kelas',
    slug: 'kelas',
    icon: Presentation,
    title: 'Ruang Kelas',
    desc: 'Kelas ber-AC dilengkapi smart board dan jaringan WiFi.',
  },
  {
    to: '/sarpras/studio',
    slug: 'studio',
    icon: Camera,
    title: 'Studio',
    desc: 'Studio film & broadcasting profesional untuk Produksi Film.',
  },
  {
    to: '/sarpras/tefa-perfilman',
    slug: 'tefa-perfilman',
    icon: Film,
    title: 'TeFa Perfilman',
    desc: 'Teaching factory Produksi Film — produksi konten siap industri.',
  },
  {
    to: '/sarpras/tefa-perkantoran',
    slug: 'tefa-perkantoran',
    icon: Briefcase,
    title: 'TeFa Perkantoran',
    desc: 'Teaching factory MPLB — simulasi layanan kantor profesional.',
  },
  {
    to: '/sarpras/tefa-bisnis-retail',
    slug: 'tefa-bisnis-retail',
    icon: ShoppingBag,
    title: 'TeFa Bisnis Retail',
    desc: 'Teaching factory Bisnis Retail — toko praktik mini market.',
  },
  {
    to: '/sarpras/tefa-akuntansi',
    slug: 'tefa-akuntansi',
    icon: Calculator,
    title: 'TeFa Akuntansi',
    desc: 'Teaching factory AKL — praktik akuntansi & perpajakan modern.',
  },
] as const

export function Sarpras() {
  const t = TONE_STYLES[TONE]
  return (
    <>
      <PageHero
        eyebrow="Sarpras"
        title="Sarana & Prasarana Sekolah"
        subtitle="Fasilitas modern yang mendukung pembelajaran berbasis praktik di SMKN 19 Jakarta — laboratorium, studio, dan teaching factory tiap jurusan."
        tone={TONE}
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'Sarpras' }]}
      />

      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SARPRAS_ITEMS.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className={`group block rounded-2xl border ${t.border} ${t.bgSubtle} p-6 transition hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl bg-white ${t.text}`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <h2
                  className={`mt-4 font-display text-lg font-bold ${t.text}`}
                >
                  {s.title}
                </h2>
                <p className={`mt-1 text-sm ${t.textSubtle}`}>{s.desc}</p>
                <span
                  className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${t.text}`}
                >
                  Lihat galeri{' '}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
