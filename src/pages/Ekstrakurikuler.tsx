import { Container } from '../components/Container'
import { SectionHeader } from '../components/SectionHeader'
import { EKSKUL } from '../data/ekskul'

export function Ekstrakurikuler() {
  return (
    <section className="py-20">
      <Container>
        <SectionHeader
          eyebrow="Ekstrakurikuler"
          title="Kegiatan Pengembangan Diri"
          subtitle="Wadah siswa mengasah minat, bakat, dan karakter."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EKSKUL.map((e) => (
            <div
              key={e.slug}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100">
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
      </Container>
    </section>
  )
}
