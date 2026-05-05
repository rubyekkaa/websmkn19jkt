import { useEffect, useState } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { Container } from '../components/Container'
import { PageHero } from '../components/PageHero'
import { TONE_STYLES } from '../data/menu'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const TONE = 'purple' as const

type AgendaEvent = {
  id: string
  title: string
  start_at: string
  end_at: string | null
  location: string | null
  category: string | null
  description: string | null
}

const PLACEHOLDER: AgendaEvent[] = [
  {
    id: 'p1',
    title: 'Pekan UTS Semester Ganjil',
    start_at: '2025-10-13',
    end_at: '2025-10-18',
    location: 'Sekolah',
    category: 'Ujian',
    description: 'Ujian Tengah Semester untuk seluruh kelas X, XI, dan XII.',
  },
  {
    id: 'p2',
    title: 'Penerimaan Rapor Tengah Semester',
    start_at: '2025-10-25',
    end_at: null,
    location: 'Aula',
    category: 'Akademik',
    description: 'Pembagian laporan tengah semester kepada orang tua/wali.',
  },
  {
    id: 'p3',
    title: 'Pekan Penilaian Akhir Semester',
    start_at: '2025-12-01',
    end_at: '2025-12-13',
    location: 'Sekolah',
    category: 'Ujian',
    description: 'Penilaian Akhir Semester (PAS) Ganjil.',
  },
  {
    id: 'p4',
    title: 'Libur Akhir Semester',
    start_at: '2025-12-22',
    end_at: '2026-01-04',
    location: '—',
    category: 'Libur',
    description: 'Libur akhir semester ganjil.',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Ujian: 'bg-red-100 text-red-700',
  Akademik: 'bg-blue-100 text-blue-700',
  Libur: 'bg-emerald-100 text-emerald-700',
  Kegiatan: 'bg-amber-100 text-amber-700',
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function KurikulumAgenda() {
  const t = TONE_STYLES[TONE]
  const [events, setEvents] = useState<AgendaEvent[]>(PLACEHOLDER)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [usingPlaceholder, setUsingPlaceholder] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      // PR C introduces this table.
      const { data, error } = await supabase
        .from('agenda_events')
        .select(
          'id, title, start_at, end_at, location, category, description',
        )
        .order('start_at', { ascending: true })
      if (cancelled) return
      if (!error && data && data.length > 0) {
        setEvents(data as AgendaEvent[])
        setUsingPlaceholder(false)
      }
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <PageHero
        eyebrow="Kurikulum"
        title="Agenda Akademik"
        subtitle="Kalender pendidikan dan jadwal kegiatan akademik resmi SMKN 19 Jakarta."
        tone={TONE}
        breadcrumbs={[
          { to: '/', label: 'Home' },
          { to: '/kurikulum', label: 'Kurikulum' },
          { label: 'Agenda Akademik' },
        ]}
      />
      <section className="py-14 sm:py-20">
        <Container>
          {usingPlaceholder && !loading && (
            <div
              className={`mb-8 rounded-2xl border ${t.border} ${t.bgSubtle} p-4 text-sm ${t.textSubtle}`}
            >
              Menampilkan contoh agenda. Konten resmi akan dikelola lewat
              panel admin setelah modul agenda aktif.
            </div>
          )}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          ) : (
            <ol className="relative space-y-4 border-l-2 border-purple-100 pl-6">
              {events.map((ev) => (
                <li key={ev.id} className="relative">
                  <span className="absolute -left-[31px] top-3 grid h-5 w-5 place-items-center rounded-full bg-white ring-2 ring-purple-300">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                  </span>
                  <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      {ev.category && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            CATEGORY_COLORS[ev.category] ??
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {ev.category}
                        </span>
                      )}
                      <h3 className="font-display text-base font-semibold text-gray-900">
                        {ev.title}
                      </h3>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                      <p className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        {fmt(ev.start_at)}
                        {ev.end_at && ev.end_at !== ev.start_at && (
                          <> — {fmt(ev.end_at)}</>
                        )}
                      </p>
                      {ev.location && ev.location !== '—' && (
                        <p className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-500" />
                          {ev.location}
                        </p>
                      )}
                    </div>
                    {ev.description && (
                      <p className="mt-3 text-sm text-gray-600">
                        {ev.description}
                      </p>
                    )}
                  </article>
                </li>
              ))}
            </ol>
          )}
        </Container>
      </section>
    </>
  )
}
