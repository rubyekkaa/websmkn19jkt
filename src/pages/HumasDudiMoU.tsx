import { useEffect, useState } from 'react'
import { Building2, Calendar, FileText, ExternalLink } from 'lucide-react'
import { Container } from '../components/Container'
import { PageHero } from '../components/PageHero'
import { TONE_STYLES } from '../data/menu'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const TONE = 'amber' as const

type MoU = {
  id: string
  partner_name: string
  partner_logo_url: string | null
  description: string | null
  signed_at: string
  expires_at: string | null
  document_url: string | null
  status: 'aktif' | 'berakhir' | null
}

const PLACEHOLDER: MoU[] = [
  {
    id: 'p1',
    partner_name: 'PT Trans Media Corpora',
    partner_logo_url: null,
    description:
      'Kerja sama magang siswa Produksi Film, guru tamu, serta penyaluran alumni di lingkup TransMedia.',
    signed_at: '2024-08-01',
    expires_at: '2027-08-01',
    document_url: null,
    status: 'aktif',
  },
  {
    id: 'p2',
    partner_name: 'Bank DKI',
    partner_logo_url: null,
    description:
      'Kerja sama praktik kerja lapangan siswa AKL & MPLB di kantor cabang Bank DKI Jakarta.',
    signed_at: '2024-05-12',
    expires_at: '2026-05-12',
    document_url: null,
    status: 'aktif',
  },
  {
    id: 'p3',
    partner_name: 'Indomaret Group',
    partner_logo_url: null,
    description:
      'Praktik kerja siswa Bisnis Retail di gerai Indomaret area Jakarta.',
    signed_at: '2023-11-20',
    expires_at: '2025-11-20',
    document_url: null,
    status: 'aktif',
  },
  {
    id: 'p4',
    partner_name: 'PT MNC Studios',
    partner_logo_url: null,
    description: 'Magang produksi film & sinetron untuk siswa Produksi Film.',
    signed_at: '2023-09-05',
    expires_at: '2026-09-05',
    document_url: null,
    status: 'aktif',
  },
]

function fmt(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function HumasDudiMoU() {
  const t = TONE_STYLES[TONE]
  const [items, setItems] = useState<MoU[]>(PLACEHOLDER)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [usingPlaceholder, setUsingPlaceholder] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      const { data, error } = await supabase
        .from('mou_partners')
        .select('*')
        .order('signed_at', { ascending: false })
      if (cancelled) return
      if (!error && data && data.length > 0) {
        setItems(data as MoU[])
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
        eyebrow="Humas / DUDI"
        title="MoU & Kerja Sama Industri"
        subtitle="Daftar perusahaan mitra yang telah menandatangani Nota Kesepahaman dengan SMKN 19 Jakarta."
        tone={TONE}
        breadcrumbs={[
          { to: '/', label: 'Home' },
          { to: '/humas-dudi', label: 'Humas/DUDI' },
          { label: 'MoU & Kerja Sama' },
        ]}
      />
      <section className="py-14 sm:py-20">
        <Container>
          {usingPlaceholder && !loading && (
            <div
              className={`mb-8 rounded-2xl border ${t.border} ${t.bgSubtle} p-4 text-sm ${t.textSubtle}`}
            >
              Menampilkan contoh MoU. Daftar resmi akan dikelola lewat panel
              admin setelah modul MoU aktif.
            </div>
          )}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {items.map((m) => (
                <article
                  key={m.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:gap-5"
                >
                  <div className="flex-none">
                    {m.partner_logo_url ? (
                      <img
                        src={m.partner_logo_url}
                        alt={m.partner_name}
                        className="h-16 w-16 rounded-xl border border-gray-200 object-contain p-1"
                      />
                    ) : (
                      <div className="grid h-16 w-16 place-items-center rounded-xl bg-amber-100 text-amber-700">
                        <Building2 className="h-7 w-7" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-gray-900">
                        {m.partner_name}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          m.status === 'berakhir'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {m.status ?? 'aktif'}
                      </span>
                    </div>
                    {m.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {m.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Tandatangan: {fmt(m.signed_at)}
                      </span>
                      {m.expires_at && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Berakhir: {fmt(m.expires_at)}
                        </span>
                      )}
                      {m.document_url && (
                        <a
                          href={m.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:underline"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Dokumen <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
