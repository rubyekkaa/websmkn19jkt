import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Briefcase, CheckCircle2, Clock } from 'lucide-react'
import { Container } from '../components/Container'
import { SectionHeader } from '../components/SectionHeader'
import { useJurusan } from '../lib/useJurusan'

export function Jurusan() {
  const { slug } = useParams()
  const { items, loading } = useJurusan()

  if (slug) {
    const j = items.find((x) => x.slug === slug)
    if (!j) {
      // Selama loading masih jalan, tunggu — slug yang baru ditambah admin
      // belum tentu ada di FALLBACK statis. Setelah loading selesai dan slug
      // tetap tidak ketemu, baru tampilkan "tidak ditemukan".
      if (loading) {
        return (
          <Container>
            <p className="py-32 text-center text-sm text-gray-500">Memuat…</p>
          </Container>
        )
      }
      return (
        <Container>
          <div className="py-32 text-center">
            <h1 className="font-display text-3xl font-bold text-gray-900">
              Jurusan tidak ditemukan
            </h1>
            <p className="mt-3 text-gray-600">
              Halaman yang Anda cari tidak ada.
            </p>
            <Link
              to="/kurikulum/jurusan"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600"
            >
              Kembali ke daftar jurusan
            </Link>
          </div>
        </Container>
      )
    }
    return (
      <>
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10">
            {j.image_url && (
              <img
                src={j.image_url}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 to-gray-950/40" />
          </div>
          <Container>
            <div className="py-24 md:py-32">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">
                Program Keahlian
              </p>
              <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold text-white sm:text-5xl">
                {j.name}
              </h1>
              {j.description && (
                <p className="mt-5 max-w-2xl text-lg text-gray-200">
                  {j.description}
                </p>
              )}
              {j.duration && (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  <Clock className="h-3.5 w-3.5" /> Durasi: {j.duration}
                </p>
              )}
            </div>
          </Container>
        </section>
        <section className="py-20">
          <Container>
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-12">
                <div>
                  <h2 className="font-display text-2xl font-bold text-gray-900">
                    Kompetensi Lulusan
                  </h2>
                  <p className="mt-3 text-gray-600">
                    Mata pelajaran kejuruan yang akan dipelajari pada jurusan{' '}
                    {j.name}.
                  </p>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {j.competencies.map((c) => (
                      <li
                        key={c}
                        className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-brand-500" />
                        <span className="text-sm font-medium text-gray-800">
                          {c}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {j.career_paths && j.career_paths.length > 0 && (
                  <div>
                    <h2 className="font-display text-2xl font-bold text-gray-900">
                      Prospek Karir
                    </h2>
                    <p className="mt-3 text-gray-600">
                      Profesi dan bidang kerja yang dapat ditekuni lulusan.
                    </p>
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {j.career_paths.map((c) => (
                        <li
                          key={c}
                          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4"
                        >
                          <Briefcase className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
                          <span className="text-sm font-medium text-amber-900">
                            {c}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <aside className="lg:col-span-1">
                <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="font-display text-lg font-semibold text-gray-900">
                    Tertarik mendaftar?
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Hubungi kami untuk informasi penerimaan murid baru.
                  </p>
                  <Link
                    to="/kontak"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Hubungi Kami <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </aside>
            </div>
            <div className="mt-16">
              <h3 className="font-display text-lg font-semibold text-gray-900">
                Jurusan lainnya
              </h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items
                  .filter((x) => x.slug !== j.slug)
                  .map((other) => (
                    <Link
                      key={other.slug}
                      to={`/kurikulum/jurusan/${other.slug}`}
                      className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand-300"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                        {other.short_name ?? ''}
                      </p>
                      <p className="mt-1 font-display text-sm font-semibold text-gray-900">
                        {other.name}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600">
                        Detail <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          </Container>
        </section>
      </>
    )
  }

  return (
    <section className="py-20">
      <Container>
        <SectionHeader
          eyebrow="Jurusan"
          title="Program Keahlian"
          subtitle="Kenali jurusan dan kompetensi unggulan kami."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {items.map((j) => (
            <Link
              key={j.slug}
              to={`/kurikulum/jurusan/${j.slug}`}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <div className="grid md:grid-cols-2">
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 md:aspect-auto">
                  {j.image_url && (
                    <img
                      src={j.image_url}
                      alt={j.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                    {j.short_name ?? ''}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-gray-900">
                    {j.name}
                  </h3>
                  {j.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                      {j.description}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                    Baca selengkapnya <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
