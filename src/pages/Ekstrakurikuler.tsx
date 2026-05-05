import { Calendar, User } from 'lucide-react'
import { Container } from '../components/Container'
import { SectionHeader } from '../components/SectionHeader'
import { useEkskul } from '../lib/useEkskul'

export function Ekstrakurikuler() {
  const { items } = useEkskul()
  return (
    <section className="py-20">
      <Container>
        <SectionHeader
          eyebrow="Ekstrakurikuler"
          title="Kegiatan Pengembangan Diri"
          subtitle="Wadah siswa mengasah minat, bakat, dan karakter."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <div
              key={e.slug}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100">
                {e.image_url && (
                  <img
                    src={e.image_url}
                    alt={e.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-base font-semibold text-gray-900">
                    {e.name}
                  </h3>
                  {e.category && (
                    <span className="flex-none rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-800">
                      {e.category}
                    </span>
                  )}
                </div>
                {e.description && (
                  <p className="mt-1 text-sm text-gray-600">{e.description}</p>
                )}
                {(e.schedule || e.pembina) && (
                  <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
                    {e.schedule && (
                      <p className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {e.schedule}
                      </p>
                    )}
                    {e.pembina && (
                      <p className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        Pembina: {e.pembina}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
