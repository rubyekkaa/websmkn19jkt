import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Container } from './Container'
import { ChevronDown, Menu, X } from 'lucide-react'
import {
  InstagramIcon,
  TikTokIcon,
  TwitterIcon,
  YoutubeIcon,
} from './SocialIcons'
import { MENU } from '../data/menu'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null)
  const location = useLocation()
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-close mobile menu on route change
  useEffect(() => {
    setOpen(false)
    setMobileSubmenu(null)
    setOpenSubmenu(null)
  }, [location.pathname])

  function openHover(label: string) {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    setOpenSubmenu(label)
  }
  function closeHover() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    closeTimeout.current = setTimeout(() => setOpenSubmenu(null), 120)
  }

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

          <nav className="hidden items-center gap-0.5 lg:flex">
            {MENU.map((item) => {
              const hasChildren = !!item.children?.length
              const isActiveParent =
                item.to &&
                (item.end
                  ? location.pathname === item.to
                  : location.pathname === item.to ||
                    location.pathname.startsWith(item.to + '/'))

              if (!hasChildren) {
                return (
                  <NavLink
                    key={item.label}
                    to={item.to!}
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
                )
              }

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => openHover(item.label)}
                  onMouseLeave={closeHover}
                >
                  <Link
                    to={item.to ?? '#'}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      isActiveParent
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    aria-haspopup="true"
                    aria-expanded={openSubmenu === item.label}
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition ${
                        openSubmenu === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </Link>
                  {openSubmenu === item.label && (
                    <div
                      className="absolute left-0 top-full z-50 min-w-[260px] pt-2"
                      onMouseEnter={() => openHover(item.label)}
                      onMouseLeave={closeHover}
                    >
                      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl ring-1 ring-black/5">
                        {item.to && (
                          <Link
                            to={item.to}
                            className="block rounded-xl px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                          >
                            Lihat semua {item.label}
                          </Link>
                        )}
                        {item.to && (
                          <div className="my-1 border-t border-gray-100" />
                        )}
                        {item.children!.map((child) => (
                          <Link
                            key={child.to}
                            to={child.to}
                            className="block rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                          >
                            <span className="block font-medium text-gray-900">
                              {child.label}
                            </span>
                            {child.description && (
                              <span className="mt-0.5 block text-xs text-gray-500">
                                {child.description}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          <div className="hidden items-center gap-1 lg:flex">
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
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-gray-100 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {MENU.map((item) => {
                const hasChildren = !!item.children?.length
                if (!hasChildren) {
                  return (
                    <NavLink
                      key={item.label}
                      to={item.to!}
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
                  )
                }
                const expanded = mobileSubmenu === item.label
                return (
                  <div key={item.label} className="rounded-md">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileSubmenu(expanded ? null : item.label)
                      }
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                      aria-expanded={expanded}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition ${
                          expanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expanded && (
                      <div className="mt-1 ml-3 flex flex-col gap-0.5 border-l border-gray-200 pl-3">
                        {item.to && (
                          <Link
                            to={item.to}
                            onClick={() => setOpen(false)}
                            className="rounded-md px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                          >
                            Semua {item.label}
                          </Link>
                        )}
                        {item.children!.map((child) => (
                          <Link
                            key={child.to}
                            to={child.to}
                            onClick={() => setOpen(false)}
                            className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
