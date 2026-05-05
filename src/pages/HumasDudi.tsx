import { Link } from 'react-router-dom'
import { ArrowRight, Handshake, Building2, GraduationCap } from 'lucide-react'
import { Container } from '../components/Container'
import { PageHero } from '../components/PageHero'
import { TONE_STYLES } from '../data/menu'

const TONE = 'amber' as const

const SUBMENU = [
  {
    to: '/humas-dudi/mou',
    icon: Handshake,
    title: 'MoU & Kerja Sama',
    desc: 'Daftar mitra industri yang telah menandatangani MoU dengan SMKN 19 Jakarta.',
  },
  {
    to: '/humas-dudi/kunjungan-industri',
    icon: Building2,
    title: 'Kunjungan Industri',
    desc: 'Galeri kegiatan kunjungan siswa ke berbagai perusahaan mitra.',
  },
  {
    to: '/humas-dudi/kelas-industri',
    icon: GraduationCap,
    title: 'Kelas Industri',
    desc: 'Galeri kegiatan kelas bersama praktisi & ahli dari dunia industri.',
  },
]

export function HumasDudi() {
  const t = TONE_STYLES[TONE]
  return (
    <>
      <PageHero
        eyebrow="Humas / DUDI"
        title="Hubungan Masyarakat & Dunia Industri"
        subtitle="Kerja sama erat dengan dunia usaha dan industri (DUDI) memastikan kurikulum kami selalu relevan dengan kebutuhan dunia kerja saat ini."
        tone={TONE}
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'Humas/DUDI' }]}
      />

      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {SUBMENU.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className={`group block rounded-3xl border ${t.border} ${t.bgSubtle} p-7 transition hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-white ${t.text}`}
                >
                  <s.icon className="h-6 w-6" />
                </div>
                <h2
                  className={`mt-5 font-display text-xl font-bold ${t.text}`}
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

          {/* Why DUDI matters */}
          <div className="mt-16 rounded-3xl border border-amber-200 bg-white p-8 shadow-sm sm:p-10">
            <h3 className="font-display text-2xl font-bold text-amber-900">
              Mengapa Kerja Sama DUDI Penting?
            </h3>
            <p className="mt-3 text-gray-600">
              Sebagai SMK, kami menerapkan prinsip{' '}
              <em>link &amp; match</em> — kurikulum dirancang bersama industri
              agar lulusan siap kerja sejak hari pertama.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {[
                {
                  num: '01',
                  title: 'Magang & Praktik Kerja',
                  desc: 'Siswa langsung berpraktik di perusahaan mitra selama 6 bulan.',
                },
                {
                  num: '02',
                  title: 'Guru Tamu',
                  desc: 'Praktisi industri mengajar di kelas untuk transfer keahlian terkini.',
                },
                {
                  num: '03',
                  title: 'Rekrutmen Lulusan',
                  desc: 'Mitra industri jadi pintu rekrutmen pertama bagi alumni SMKN 19.',
                },
              ].map((b) => (
                <div
                  key={b.num}
                  className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5"
                >
                  <p className="font-display text-2xl font-bold text-amber-700">
                    {b.num}
                  </p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {b.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
