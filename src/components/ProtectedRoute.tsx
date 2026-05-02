import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import type { ReactNode } from 'react'
import type { UserRole } from '../types'

function Spinner() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  )
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner />

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <>{children}</>
}

export function RoleGuard({
  children,
  roles,
}: {
  children: ReactNode
  roles: UserRole[]
}) {
  const { user, profile, loading, migrationMissing } = useAuth()

  if (loading) return <Spinner />

  // Migration belum jalan (tabel profiles belum ada) → izinkan akses
  // sementara, banner peringatan di AdminLayout. Backend RLS tetap aman.
  if (migrationMissing && user) return <>{children}</>

  if (!profile || !roles.includes(profile.role)) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
        <h2 className="font-display text-lg font-semibold text-amber-900">
          Akses ditolak
        </h2>
        <p className="mt-1 text-sm text-amber-800">
          Halaman ini hanya dapat diakses oleh pengguna dengan role{' '}
          <strong>{roles.join(' / ')}</strong>. Hubungi administrator untuk
          ditingkatkan hak aksesnya.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
