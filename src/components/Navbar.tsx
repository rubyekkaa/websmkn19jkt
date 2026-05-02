import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Container } from './Container'
import { Menu, X } from 'lucide-react'
import {
  InstagramIcon,
  TikTokIcon,
  TwitterIcon,
  YoutubeIcon,
} from './SocialIcons'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/profil', label: 'Profil' },
  { to: '/jurusan', label: 'Jurusan' },
  { to: '/ekstrakurikuler', label: 'Ekstrakurikuler' },
  { to: '/berita', label: 'Berita' },
  { to: '/kontak', label: 'Kontak' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <img
              src="/images/logo_19.png"
              alt="SMKN 19 Jakarta"
              className="h-10 w-10 object-contain"
            />
            <div className="leading-tight">
              <p className="font-display text-sm font-bold text-gray-900">
                SMKN 19
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Jakarta
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-1 md:flex">
            <a
              href="https://instagram.com/smkn19jkt"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-pink-600"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href="https://tiktok.com/@smkn19jkt"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
            >
              <TikTokIcon className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com/smkn19jkt"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-sky-600"
            >
              <TwitterIcon className="h-4 w-4" />
            </a>
            <a
              href="https://youtube.com/@smkn19jkt"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"
            >
              <YoutubeIcon className="h-4 w-4" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-gray-100 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
