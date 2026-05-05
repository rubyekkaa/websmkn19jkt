import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Calendar } from 'lucide-react'
import { Container } from '../components/Container'
import { PageHero } from '../components/PageHero'
import { useJurusan } from '../lib/useJurusan'
import { TONE_STYLES } from '../data/menu'

const TONE = 'purple' as const

export function Kurikulum() {
  const t = TONE_STYLES[TONE]
  const { items: jurusan } = useJurusan()
  return (
    <>
      <PageHero
        eyebrow="Kurikulum"
        title="Program Keahlian & Agenda Akademik"
        subtitle="SMKN 19 Jakarta menyelenggarakan empat program keahlian berbasis link & match dengan dunia industri, didukung agenda akademik yang terstruktur tiap semester."
        tone={TONE}
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'Kurikulum' }]}
      />

      {/* Submenu cards */}
      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <Link
              to="/kurikulum/jurusan"
              className={`group block rounded-3xl border ${t.border} ${t.bgSubtle} p-8 transition hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div
                className={`grid h-12 w-12 place-items-center rounded-2xl bg-white ${t.text}`}
              >
                <BookOpen className="h-6 w-6" />
              </div>
              <h2
                className={`mt-5 font-display text-2xl font-bold ${t.text}`}
              >
                Jurusan
              </h2>
              <p className={`mt-2 text-sm ${t.textSubtle}`}>
                Empat program keahlian: Produksi Film, Akuntansi (AKL),
                Manajemen Perkantoran (MPLB), dan Bisnis Retail.
              </p>
              <span
                className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${t.text}`}
              >
                Lihat semua jurusan{' '}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              to="/kurikulum/agenda"
              className={`group block rounded-3xl border ${t.border} ${t.bgSubtle} p-8 transition hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div
                className={`grid h-12 w-12 place-items-center rounded-2xl bg-white ${t.text}`}
              >
                <Calendar className="h-6 w-6" />
              </div>
              <h2
                className={`mt-5 font-display text-2xl font-bold ${t.text}`}
              >
                Agenda Akademik
              </h2>
              <p className={`mt-2 text-sm ${t.textSubtle}`}>
                Kalender pendidikan, jadwal UTS &amp; UAS, libur sekolah, serta
                kegiatan akademik resmi tahunan.
              </p>
              <span
                className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${t.text}`}
              >
                Lihat agenda{' '}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>

          {/* Highlight: 4 jurusan */}
          <div className="mt-16">
            <h3 className="font-display text-xl font-bold text-gray-900">
              Program Keahlian Unggulan
            </h3>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {jurusan.map((j) => (
                <Link
                  key={j.slug}
                  to={`/kurikulum/jurusan/${j.slug}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={j.image_url ?? ''}
                      alt={j.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                      {j.short_name ?? ''}
                    </p>
                    <h4 className="mt-1 font-display text-base font-semibold text-gray-900">
                      {j.name}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
