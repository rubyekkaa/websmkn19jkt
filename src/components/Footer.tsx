import { Link } from 'react-router-dom'
import { Container } from './Container'
import { MapPin, Phone, Mail } from 'lucide-react'
import {
  InstagramIcon,
  TikTokIcon,
  TwitterIcon,
  YoutubeIcon,
} from './SocialIcons'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-20 bg-gray-950 text-gray-300">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/images/logo_19.png"
                alt="SMKN 19 Jakarta"
                className="h-12 w-12 object-contain"
              />
              <div className="leading-tight">
                <p className="font-display text-base font-bold text-white">
                  SMKN 19 Jakarta
                </p>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Sekolah Berkarakter & Berprestasi
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Mencetak generasi siap kerja yang bertaqwa, cerdas, terampil, dan
              berwawasan lingkungan.
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href="https://instagram.com/smkn19jkt"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-pink-600"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="https://tiktok.com/@smkn19jkt"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-black"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/smkn19jkt"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-sky-600"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com/@smkn19jkt"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-red-600"
              >
                <YoutubeIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-200">
              Jelajahi
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ['/', 'Home'],
                ['/profil', 'Profil'],
                ['/kurikulum', 'Kurikulum'],
                ['/humas-dudi', 'Humas/DUDI'],
                ['/kesiswaan', 'Kesiswaan'],
                ['/sarpras', 'Sarpras'],
                ['/berita', 'Berita'],
                ['/kontak', 'Kontak'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-gray-400 transition hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-200">
              Program Keahlian
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ['/kurikulum/jurusan/akl', 'Akuntansi (AKL)'],
                ['/kurikulum/jurusan/bisnis-retail', 'Bisnis Retail'],
                ['/kurikulum/jurusan/mplb', 'Manajemen Perkantoran'],
                ['/kurikulum/jurusan/produksi-film', 'Produksi Film'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-gray-400 transition hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-200">
              Kontak Kami
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-none text-gray-500" />
                <span>
                  Jl. Danau Limboto No.11, RT.21/RW.4, Bend. Hilir, Tanah Abang,
                  Jakarta Pusat 10210
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 flex-none text-gray-500" />
                <a
                  href="tel:0215734929"
                  className="transition hover:text-white"
                >
                  (021) 5734929
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-none text-gray-500" />
                <a
                  href="mailto:smkn19jkt@gmail.com"
                  className="transition hover:text-white"
                >
                  smkn19jkt@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
          © {year} SMKN 19 Jakarta. All rights reserved.
        </div>
      </Container>
    </footer>
  )
}
