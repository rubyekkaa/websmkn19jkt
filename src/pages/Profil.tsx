import { useEffect, useMemo, useState } from 'react'
import { Container } from '../components/Container'
import { SectionHeader } from '../components/SectionHeader'
import { GURU } from '../data/guru'
import { supabase } from '../lib/supabase'
import type { TeacherGrup } from '../types'
import { Search } from 'lucide-react'

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
      if (error || !data || data.length === 0) {
        // Tabel teachers belum di-setup → tetap pakai fallback
        return
      }
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
      {/* Sambutan */}
      <section className="bg-white py-20">
        <Container size="narrow">
          <div className="text-center">
            <div className="mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-brand-100 bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&h=400&q=70"
                alt="Kepala Sekolah"
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold text-gray-900 sm:text-4xl">
              Sambutan Kepala Sekolah
            </h1>
            <p className="mt-1 text-sm text-gray-500">Ibu Sri Muljani, S.Pd.</p>
          </div>
          <div className="mt-10 space-y-4 text-base leading-relaxed text-gray-700">
            <p>Assalamualaikum warahmatullahi wabarakatuh,</p>
            <p>
              Selamat datang di website resmi SMKN 19 Jakarta. Kami berkomitmen
              mewujudkan lulusan yang bertaqwa, cerdas, terampil, dan berdaya
              saing, melalui pembelajaran berbasis proyek, link & match dengan
              industri, serta lingkungan belajar yang aman dan menyenangkan.
            </p>
            <p>
              Kami mengundang seluruh warga sekolah dan orang tua untuk
              bersinergi membentuk karakter peserta didik yang berakhlak mulia
              dan adaptif terhadap perkembangan teknologi.
            </p>
            <p>Wassalamualaikum warahmatullahi wabarakatuh.</p>
          </div>
        </Container>
      </section>

      {/* Profil sekolah */}
      <section className="bg-gray-50 py-20">
        <Container>
          <SectionHeader
            eyebrow="Profil"
            title="Profil Sekolah"
            subtitle="Visi dan Misi SMKN 19 Jakarta."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="font-display text-lg font-semibold text-gray-900">
                Visi
              </h3>
              <p className="mt-3 text-gray-700">
                Terwujudnya Sumber Daya Manusia yang Bertaqwa, Cerdas, Terampil,
                Berbudaya Lingkungan dan Berwawasan Global.
              </p>
              <h3 className="mt-8 font-display text-lg font-semibold text-gray-900">
                Misi
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700 marker:text-brand-500">
                <li>
                  Meningkatkan kualitas keimanan, ketaqwaan, dan akhlak mulia.
                </li>
                <li>Menumbuhkembangkan semangat dan berinovasi.</li>
                <li>
                  Menyiapkan murid yang kompeten dan mampu bersaing secara
                  global.
                </li>
                <li>
                  Meningkatkan profesionalitas dan kompetensi guru berbasis
                  teknologi.
                </li>
                <li>
                  Mengembangkan kegiatan pembelajaran yang berkesadaran,
                  bermakna, dan menyenangkan sesuai dengan dunia usaha dan
                  industri.
                </li>
                <li>Mewujudkan sekolah yang berbudaya Adiwiyata.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="font-display text-lg font-semibold text-gray-900">
                Sekilas
              </h3>
              <p className="mt-3 text-gray-700">
                SMKN 19 Jakarta berkomitmen mencetak lulusan berkarakter,
                kompeten, dan siap bersaing melalui pembelajaran berkualitas
                serta kemitraan industri.
              </p>
              <dl className="mt-6 space-y-3 text-sm text-gray-700">
                <div>
                  <dt className="font-medium text-gray-900">Alamat</dt>
                  <dd>
                    Jl. Danau Limboto No.11, RT.21/RW.4, Bend. Hilir, Tanah
                    Abang, Jakarta Pusat 10210
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Telepon</dt>
                  <dd>(021) 5734929</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Email</dt>
                  <dd>
                    <a
                      href="mailto:smkn19jkt@gmail.com"
                      className="text-brand-600 hover:underline"
                    >
                      smkn19jkt@gmail.com
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Website</dt>
                  <dd>
                    <a
                      href="https://smkn19jkt.sch.id/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-600 hover:underline"
                    >
                      smkn19jkt.sch.id
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Container>
      </section>

      {/* Daftar Guru & Tata Usaha */}
      <section className="py-20">
        <Container>
          <SectionHeader
            eyebrow="Tenaga Pendidik & Kependidikan"
            title="Daftar Guru & Tata Usaha"
            subtitle="Tim pengajar dan tenaga kependidikan SMKN 19 Jakarta."
          />
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama / jabatan…"
                className="w-full rounded-full border-gray-300 pl-9 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="rounded-full border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
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
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <h2 className="font-display text-2xl font-bold text-gray-900">
                      {grup === 'Guru' ? 'Daftar Guru' : 'Tata Usaha'}
                    </h2>
                    <span className="text-sm text-gray-500">
                      Total: <span className="font-semibold text-gray-900">{totalGrup}</span> orang
                    </span>
                  </div>
                  <div className="mt-8 space-y-10">
                    {sections.map(([kat, list]) => (
                      <div key={kat}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-lg font-semibold text-gray-900">
                            {kat}
                          </h3>
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            {list.length} orang
                          </span>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          {list.map((g) => (
                            <div
                              key={g.name}
                              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                            >
                              {g.foto_url ? (
                                <img
                                  src={g.foto_url}
                                  alt={g.name}
                                  loading="lazy"
                                  className="h-10 w-10 flex-none rounded-full object-cover"
                                />
                              ) : (
                                <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700">
                                  <span className="text-xs font-semibold">
                                    {g.name
                                      .split(' ')
                                      .map((s) => s[0])
                                      .slice(0, 2)
                                      .join('')}
                                  </span>
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                  {g.name}
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                  {g.jabatan}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                Tidak ada hasil untuk pencarian Anda.
              </p>
            )}
          </div>
        </Container>
      </section>
    </>
  )
}
