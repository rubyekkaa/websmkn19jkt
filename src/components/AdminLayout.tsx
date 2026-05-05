import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  FileText,
  FolderClosed,
  Handshake,
  Hash,
  Home,
  Image as ImageIcon,
  LogOut,
  Plus,
  Shield,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import type { UserRole } from '../types'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  roles: UserRole[]
}

const NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: Home, end: true, roles: ['admin', 'editor'] },
  { to: '/admin/berita', label: 'Berita', icon: FileText, roles: ['admin', 'editor'] },
  { to: '/admin/kategori', label: 'Kategori', icon: FolderClosed, roles: ['admin', 'editor'] },
  { to: '/admin/tag', label: 'Tag', icon: Hash, roles: ['admin', 'editor'] },
  { to: '/admin/galleries', label: 'Galeri', icon: ImageIcon, roles: ['admin', 'editor'] },
  { to: '/admin/jurusan', label: 'Jurusan', icon: BookOpen, roles: ['admin', 'editor'] },
  { to: '/admin/ekskul', label: 'Ekskul', icon: Sparkles, roles: ['admin', 'editor'] },
  { to: '/admin/mou', label: 'MoU', icon: Handshake, roles: ['admin', 'editor'] },
  { to: '/admin/agenda', label: 'Agenda', icon: Calendar, roles: ['admin', 'editor'] },
  { to: '/admin/guru', label: 'Guru & TU', icon: Users, roles: ['admin'] },
  { to: '/admin/users', label: 'Pengguna', icon: Shield, roles: ['admin'] },
]

export function AdminLayout() {
  const { user, profile, signOut, migrationMissing } = useAuth()
  const navigate = useNavigate()

  const role = profile?.role
  // Kalau migrasi roles.sql belum jalan (tabel profiles belum ada),
  // tampilkan semua menu sebagai fallback supaya admin tetap bisa navigasi.
  // RLS di Supabase tetap melindungi data backend.
  const items = migrationMissing
    ? NAV
    : NAV.filter((n) => (role ? n.roles.includes(role) : false))

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
              <img
                src="/images/logo_19.png"
                alt="SMKN 19 Jakarta"
                className="h-9 w-9 object-contain"
              />
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
            {items.map(({ to, label, icon: Icon, end }) => (
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
              {role && (
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    role === 'admin'
                      ? 'bg-brand-50 text-brand-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {role}
                </span>
              )}
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
          {migrationMissing && (
            <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">
                Migrasi role belum dijalankan.
              </p>
              <p className="mt-1">
                Jalankan{' '}
                <code className="rounded bg-amber-100 px-1">
                  supabase/roles.sql
                </code>{' '}
                di Supabase SQL Editor agar fitur role-based access aktif.
                Selama migrasi belum jalan, semua menu ditampilkan tetapi
                pembatasan akses tidak berfungsi di sisi frontend (backend RLS
                tetap aman).
              </p>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
