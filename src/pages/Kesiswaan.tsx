import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Trophy } from 'lucide-react'
import { Container } from '../components/Container'
import { PageHero } from '../components/PageHero'
import { TONE_STYLES } from '../data/menu'
import { useEkskul } from '../lib/useEkskul'

const TONE = 'teal' as const

const SUBMENU = [
  {
    to: '/kesiswaan/ekstrakurikuler',
    icon: Trophy,
    title: 'Ekstrakurikuler',
    desc: 'Wadah mengasah minat & bakat — Paskibra, Pramuka, PMR, KIR, Futsal, Basket, Rohis, English Club, dan lainnya.',
  },
  {
    to: '/kesiswaan/kegiatan-rutin',
    icon: Sparkles,
    title: 'Kegiatan Rutin',
    desc: 'Galeri kegiatan rutin sekolah — upacara, peringatan hari besar, classmeeting, dan acara siswa lainnya.',
  },
]

export function Kesiswaan() {
  const t = TONE_STYLES[TONE]
  const { items: ekskul } = useEkskul()
  return (
    <>
      <PageHero
        eyebrow="Kesiswaan"
        title="Pengembangan Karakter & Bakat Siswa"
        subtitle="Membentuk siswa SMKN 19 Jakarta yang aktif, kreatif, dan berkarakter melalui beragam kegiatan ekstrakurikuler dan acara rutin sekolah."
        tone={TONE}
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'Kesiswaan' }]}
      />

      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            {SUBMENU.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className={`group block rounded-3xl border ${t.border} ${t.bgSubtle} p-8 transition hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-white ${t.text}`}
                >
                  <s.icon className="h-6 w-6" />
                </div>
                <h2
                  className={`mt-5 font-display text-2xl font-bold ${t.text}`}
                >
                  {s.title}
                </h2>
                <p className={`mt-2 text-sm ${t.textSubtle}`}>{s.desc}</p>
                <span
                  className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${t.text}`}
                >
                  Selengkapnya{' '}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>

          {/* Highlight ekskul */}
          <div className="mt-16">
            <h3 className="font-display text-xl font-bold text-gray-900">
              Ekstrakurikuler Pilihan
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Setiap siswa wajib mengikuti minimal satu ekstrakurikuler.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ekskul.slice(0, 8).map((e) => (
                <div
                  key={e.slug}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100">
                    {e.image_url && (
                      <img
                        src={e.image_url}
                        alt={e.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-display text-sm font-semibold text-gray-900">
                      {e.name}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
