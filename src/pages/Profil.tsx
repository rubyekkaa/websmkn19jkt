import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Quote,
  Target,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  GraduationCap,
  Trophy,
} from 'lucide-react'
import { Container } from '../components/Container'
import { PageHero } from '../components/PageHero'
import { GURU } from '../data/guru'
import { supabase } from '../lib/supabase'
import type { TeacherGrup } from '../types'

const TONE = 'rose' as const

type Person = {
  name: string
  jabatan: string
  kategori: string
  grup: TeacherGrup
  foto_url: string | null
  sort_order: number
}

const FALLBACK: Person[] = GURU.map((g, i) => ({
  name: g.name,
  jabatan: g.jabatan,
  kategori: g.kategori,
  grup: g.grup,
  foto_url: null,
  sort_order: i,
}))

const MISI = [
  'Meningkatkan kualitas keimanan, ketaqwaan, dan akhlak mulia.',
  'Menumbuhkembangkan semangat berinovasi dan berkreasi.',
  'Menyiapkan murid yang kompeten dan mampu bersaing secara global.',
  'Meningkatkan profesionalitas dan kompetensi guru berbasis teknologi.',
  'Mengembangkan pembelajaran berkesadaran, bermakna, dan menyenangkan, sesuai dengan dunia usaha dan industri.',
  'Mewujudkan sekolah yang berbudaya Adiwiyata.',
]

export function Profil() {
  const [people, setPeople] = useState<Person[]>(FALLBACK)
  const [q, setQ] = useState('')
  const [kategori, setKategori] = useState<string>('Semua')

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error } = await supabase
        .from('teachers')
        .select('name, jabatan, kategori, grup, foto_url, sort_order')
        .order('grup', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
      if (cancelled) return
      if (error || !data || data.length === 0) return
      setPeople(data as Person[])
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const kategoriList = useMemo(
    () => ['Semua', ...Array.from(new Set(people.map((g) => g.kategori)))],
    [people],
  )

  const filtered = useMemo(() => {
    return people.filter((g) => {
      const matchQ =
        !q ||
        g.name.toLowerCase().includes(q.toLowerCase()) ||
        g.jabatan.toLowerCase().includes(q.toLowerCase())
      const matchK = kategori === 'Semua' || g.kategori === kategori
      return matchQ && matchK
    })
  }, [people, q, kategori])

  const grouped = useMemo(() => {
    const out: Record<TeacherGrup, Record<string, Person[]>> = {
      Guru: {},
      'Tata Usaha': {},
    }
    for (const g of filtered) {
      out[g.grup][g.kategori] = out[g.grup][g.kategori] ?? []
      out[g.grup][g.kategori].push(g)
    }
    return out
  }, [filtered])

  const totalGuru = useMemo(
    () => people.filter((g) => g.grup === 'Guru').length,
    [people],
  )
  const totalTU = useMemo(
    () => people.filter((g) => g.grup === 'Tata Usaha').length,
    [people],
  )

  return (
    <>
      <PageHero
        eyebrow="Profil"
        title="Tentang SMKN 19 Jakarta"
        subtitle="Sekolah Berkarakter & Berprestasi — mencetak generasi siap kerja, kompeten, dan berdaya saing."
        tone={TONE}
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'Profil' }]}
      />

      {/* Stats strip */}
      <section className="border-b border-rose-100 bg-white">
        <Container>
          <div className="grid gap-6 py-10 sm:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                value: '4',
                label: 'Program Keahlian',
              },
              {
                icon: Users,
                value: `${totalGuru + totalTU}+`,
                label: 'Tenaga Pendidik & Kependidikan',
              },
              {
                icon: Trophy,
                value: '8+',
                label: 'Ekstrakurikuler Aktif',
              },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4">
                <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-rose-50 text-rose-700">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-gray-900">
                    {s.value}
                  </p>
                  <p className="text-sm text-gray-600">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Sambutan Kepala Sekolah */}
      <section className="bg-rose-50/60 py-16 sm:py-24">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="relative mx-auto max-w-sm">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-rose-200 to-rose-100 blur-xl" />
                <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-white shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&h=720&q=70"
                    alt="Kepala Sekolah"
                    className="aspect-[5/6] w-full object-cover"
                  />
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="font-display text-lg font-bold text-rose-900">
                  Ibu Sri Muljani, S.Pd.
                </p>
                <p className="mt-1 text-sm text-rose-700">
                  Kepala SMKN 19 Jakarta
                </p>
              </div>
            </div>
            <div className="lg:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Sambutan Kepala Sekolah
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-rose-900 sm:text-4xl">
                Selamat Datang di SMKN 19 Jakarta
              </h2>
              <Quote className="mt-6 h-8 w-8 text-rose-300" />
              <div className="mt-3 space-y-4 text-base leading-relaxed text-gray-700">
                <p>
                  <strong>Assalamualaikum warahmatullahi wabarakatuh,</strong>
                </p>
                <p>
                  Selamat datang di website resmi SMKN 19 Jakarta. Kami
                  berkomitmen mewujudkan lulusan yang bertaqwa, cerdas,
                  terampil, dan berdaya saing, melalui pembelajaran berbasis
                  proyek, <em>link &amp; match</em> dengan industri, serta
                  lingkungan belajar yang aman dan menyenangkan.
                </p>
                <p>
                  Kami mengundang seluruh warga sekolah dan orang tua untuk
                  bersinergi membentuk karakter peserta didik yang berakhlak
                  mulia dan adaptif terhadap perkembangan teknologi.
                </p>
                <p>Wassalamualaikum warahmatullahi wabarakatuh.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Visi & Misi */}
      <section className="bg-white py-16 sm:py-24">
        <Container>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="h-full rounded-3xl border border-purple-200 bg-purple-50/70 p-8 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-700">
                  Visi
                </p>
                <div className="mt-3 grid h-12 w-12 place-items-center rounded-2xl bg-purple-600 text-white shadow-sm">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-purple-900">
                  Cita-cita SMKN 19
                </h3>
                <p className="mt-3 text-gray-700">
                  Terwujudnya Sumber Daya Manusia yang{' '}
                  <strong>
                    Bertaqwa, Cerdas, Terampil, Berbudaya Lingkungan dan
                    Berwawasan Global
                  </strong>
                  .
                </p>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-full rounded-3xl border border-amber-200 bg-amber-50/70 p-8 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Misi
                </p>
                <div className="mt-3 grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-white shadow-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-amber-900">
                  Langkah Menuju Visi
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {MISI.map((m, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-white/80 p-3 text-sm text-gray-700"
                    >
                      <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-amber-500 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Info sekolah */}
      <section className="bg-white py-16 sm:py-24">
        <Container>
          <div className="rounded-3xl border border-sky-200 bg-sky-50/70 p-8 shadow-sm sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              Informasi Sekolah
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold text-sky-900 sm:text-3xl">
              Profil Singkat & Kontak
            </h3>
            <p className="mt-3 max-w-3xl text-gray-700">
              SMKN 19 Jakarta berkomitmen mencetak lulusan berkarakter,
              kompeten, dan siap bersaing melalui pembelajaran berkualitas
              serta kemitraan industri.
            </p>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: MapPin,
                  label: 'Alamat',
                  value:
                    'Jl. Danau Limboto No.11, RT.21/RW.4, Bend. Hilir, Tanah Abang, Jakarta Pusat 10210',
                },
                {
                  icon: Phone,
                  label: 'Telepon',
                  value: '(021) 5734929',
                },
                {
                  icon: Mail,
                  label: 'Email',
                  href: 'mailto:smkn19jkt@gmail.com',
                  value: 'smkn19jkt@gmail.com',
                },
                {
                  icon: Globe,
                  label: 'Website',
                  href: 'https://smkn19jkt.sch.id/',
                  external: true,
                  value: 'smkn19jkt.sch.id',
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="flex items-start gap-3 rounded-2xl border border-sky-200/80 bg-white/90 p-4"
                >
                  <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-xl bg-sky-100 text-sky-700">
                    <c.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {c.label}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-800">
                      {c.href ? (
                        <a
                          href={c.href}
                          target={c.external ? '_blank' : undefined}
                          rel={c.external ? 'noreferrer' : undefined}
                          className="text-sky-700 hover:underline"
                        >
                          {c.value}
                        </a>
                      ) : (
                        c.value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* Daftar Guru & TU */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <Container>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
              Tenaga Pendidik & Kependidikan
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-gray-900 sm:text-4xl">
              Daftar Guru &amp; Tata Usaha
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Tim pengajar dan tenaga kependidikan SMKN 19 Jakarta.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama / jabatan…"
                className="w-full rounded-full border-gray-300 pl-9 text-sm focus:border-rose-500 focus:ring-rose-500"
              />
            </div>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="rounded-full border-gray-300 text-sm focus:border-rose-500 focus:ring-rose-500"
            >
              {kategoriList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {filtered.length} dari {people.length}
            </span>
          </div>

          <div className="mt-12 space-y-14">
            {(['Guru', 'Tata Usaha'] as const).map((grup) => {
              const totalGrup = grup === 'Guru' ? totalGuru : totalTU
              const sections = Object.entries(grouped[grup])
              if (sections.length === 0) return null
              return (
                <div key={grup}>
                  <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                    <h3 className="font-display text-2xl font-bold text-gray-900">
                      {grup === 'Guru' ? 'Daftar Guru' : 'Tata Usaha'}
                    </h3>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                      {totalGrup} orang
                    </span>
                  </div>
                  {sections.map(([kat, list]) => (
                    <div key={kat} className="mt-8">
                      <h4 className="font-display text-base font-semibold text-rose-900">
                        {kat}
                      </h4>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {list.map((p) => (
                          <div
                            key={`${p.name}-${p.jabatan}`}
                            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
                          >
                            <div className="h-12 w-12 flex-none overflow-hidden rounded-full bg-gradient-to-br from-rose-100 to-rose-200 ring-2 ring-rose-100">
                              {p.foto_url ? (
                                <img
                                  src={p.foto_url}
                                  alt={p.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <div className="grid h-full w-full place-items-center text-xs font-bold text-rose-700">
                                  {initials(p.name)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-display text-sm font-semibold text-gray-900">
                                {p.name}
                              </p>
                              <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                                {p.jabatan}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </Container>
      </section>
    </>
  )
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}
