import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { isSupabaseConfigured } from '../../lib/supabase'

type LocationState = { from?: string }

export function AdminLogin() {
  const { user, signIn } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = (location.state as LocationState | null)?.from ?? '/admin'

  if (user) return <Navigate to={from} replace />

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-50 via-white to-gray-50 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">
            <span className="font-display text-base font-bold">19</span>
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-gray-900">
            Login Admin
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Masuk untuk mengelola konten website.
          </p>
        </div>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border-gray-300 pl-9 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border-gray-300 pl-9 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>
          </div>
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {!isSupabaseConfigured && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Supabase belum dikonfigurasi. Salin <code>.env.example</code> ke{' '}
              <code>.env.local</code> dan isi nilainya.
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured}
            className="w-full rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? 'Memproses…' : 'Masuk'}
          </button>
        </form>
        <Link
          to="/"
          className="mt-6 block text-center text-xs text-gray-500 hover:text-brand-600"
        >
          ← Kembali ke website
        </Link>
      </div>
    </div>
  )
}
