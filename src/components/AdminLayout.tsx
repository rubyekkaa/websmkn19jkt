import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  FileText,
  FolderClosed,
  Hash,
  Home,
  LogOut,
  Plus,
} from 'lucide-react'
import { useAuth } from '../lib/auth'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: Home, end: true },
  { to: '/admin/berita', label: 'Berita', icon: FileText },
  { to: '/admin/kategori', label: 'Kategori', icon: FolderClosed },
  { to: '/admin/tag', label: 'Tag', icon: Hash },
]

export function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="flex w-full flex-none flex-col border-b border-gray-200 bg-white lg:w-64 lg:border-b-0 lg:border-r">
          <div className="flex h-16 items-center justify-between gap-3 border-b border-gray-100 px-5 lg:justify-start">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-white">
                <span className="font-display text-xs font-bold">19</span>
              </div>
              <div className="leading-tight">
                <p className="font-display text-sm font-bold text-gray-900">
                  Admin
                </p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                  SMKN 19
                </p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 space-y-0.5 p-3">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <Link
              to="/admin/berita/baru"
              className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" /> Berita Baru
            </Link>
          </nav>
          <div className="border-t border-gray-100 p-3">
            <div className="mb-2 px-2 text-xs text-gray-500">
              Login sebagai
              <p className="truncate font-medium text-gray-800">
                {user?.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" /> Keluar
            </button>
            <Link
              to="/"
              className="mt-1 block px-3 py-1 text-center text-xs text-gray-500 hover:text-brand-600"
            >
              ← Lihat website
            </Link>
          </div>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
