import { useState } from 'react'
import { Container } from '../components/Container'
import { SectionHeader } from '../components/SectionHeader'
import { Mail, MapPin, Phone, Clock, Send, CheckCircle2 } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export function Kontak() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pesan, setPesan] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (isSupabaseConfigured) {
        const { error: err } = await supabase.from('contact_messages').insert({
          name,
          email,
          message: pesan,
        })
        if (err) throw err
      } else {
        await new Promise((r) => setTimeout(r, 800))
      }
      setDone(true)
      setName('')
      setEmail('')
      setPesan('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`Gagal mengirim pesan: ${msg}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-20">
      <Container>
        <SectionHeader
          eyebrow="Kontak"
          title="Hubungi Kami"
          subtitle="Silakan tinggalkan pesan atau kunjungi alamat sekolah."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          >
            {done ? (
              <div className="grid place-items-center py-10 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <h3 className="mt-4 font-display text-lg font-semibold text-gray-900">
                  Pesan terkirim!
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Terima kasih, kami akan menghubungi Anda segera.
                </p>
                <button
                  type="button"
                  onClick={() => setDone(false)}
                  className="mt-5 rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:border-brand-500 hover:text-brand-600"
                >
                  Kirim lagi
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nama
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pesan"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Pesan
                    </label>
                    <textarea
                      id="pesan"
                      required
                      rows={5}
                      value={pesan}
                      onChange={(e) => setPesan(e.target.value)}
                      className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
                    />
                  </div>
                </div>
                {error && (
                  <p className="mt-3 text-sm text-red-600">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {submitting ? (
                    'Mengirim…'
                  ) : (
                    <>
                      Kirim <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
                {!isSupabaseConfigured && (
                  <p className="mt-3 text-center text-xs text-gray-400">
                    (Supabase belum dikonfigurasi — pesan tidak benar-benar
                    disimpan.)
                  </p>
                )}
              </>
            )}
          </form>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="font-display text-lg font-semibold text-gray-900">
                Informasi Kontak
              </h3>
              <ul className="mt-4 space-y-4 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 flex-none text-brand-500" />
                  <div>
                    <p className="font-medium text-gray-900">Alamat</p>
                    <p>
                      Jl. Danau Limboto No.11, RT.21/RW.4, Bend. Hilir, Tanah
                      Abang, Jakarta Pusat 10210
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 flex-none text-brand-500" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <a
                      href="mailto:smkn19jkt@gmail.com"
                      className="text-brand-600 hover:underline"
                    >
                      smkn19jkt@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 flex-none text-brand-500" />
                  <div>
                    <p className="font-medium text-gray-900">Telepon</p>
                    <a
                      href="tel:0215734929"
                      className="text-brand-600 hover:underline"
                    >
                      (021) 5734929
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 flex-none text-brand-500" />
                  <div>
                    <p className="font-medium text-gray-900">Jam Layanan</p>
                    <p>Senin–Jumat, 07.00–15.00 WIB</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <iframe
                title="Lokasi SMKN 19 Jakarta"
                src="https://www.google.com/maps?q=SMKN+19+Jakarta+Jl.+Danau+Limboto+No.11&output=embed"
                className="h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
                Jika peta tidak tampil, buka langsung di{' '}
                <a
                  href="https://maps.google.com/?q=SMKN+19+Jakarta"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  Google Maps
                </a>
                .
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
