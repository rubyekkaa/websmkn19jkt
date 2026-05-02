import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from './supabase'
import type { Profile, UserRole } from '../types'

type AuthCtx = {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: UserRole | null
  loading: boolean
  /**
   * `true` kalau tabel `profiles` belum dibuat (migrasi `roles.sql` belum
   * dijalankan). Hanya bernilai true kalau Supabase mengembalikan error
   * "table not found" / PGRST205. Untuk error lain (RLS block, network),
   * tetap `false` supaya RoleGuard bisa menolak akses dengan tegas.
   */
  migrationMissing: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

type FetchResult = {
  profile: Profile | null
  migrationMissing: boolean
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [migrationMissing, setMigrationMissing] = useState(false)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string): Promise<FetchResult> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) {
      const code = error.code ?? ''
      const msg = error.message ?? ''
      const tableMissing =
        code === 'PGRST205' ||
        code === '42P01' ||
        msg.toLowerCase().includes('does not exist') ||
        msg.toLowerCase().includes('schema cache')
      return { profile: null, migrationMissing: tableMissing }
    }
    return {
      profile: (data as Profile | null) ?? null,
      migrationMissing: false,
    }
  }

  async function applyProfile(userId: string) {
    const { profile: p, migrationMissing: m } = await fetchProfile(userId)
    setProfile(p)
    setMigrationMissing(m)
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let cancelled = false
    // Safety timeout: pastikan loading selalu selesai dalam 5 detik,
    // bahkan kalau Supabase getSession/fetchProfile lambat / hang.
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, 5000)

    void supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (cancelled) return
        setSession(data.session)
        if (data.session?.user) {
          await applyProfile(data.session.user.id)
        }
        if (!cancelled) {
          setLoading(false)
          window.clearTimeout(timeoutId)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false)
          window.clearTimeout(timeoutId)
        }
      })

    // PENTING: jangan call supabase methods langsung di dalam callback ini —
    // Supabase JS bisa deadlock kalau dipanggil sinkron di dalam listener.
    // Defer dengan setTimeout(..., 0).
    // Ref: https://supabase.com/docs/reference/javascript/auth-onauthstatechange
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s?.user) {
        const userId = s.user.id
        window.setTimeout(() => {
          if (!cancelled) void applyProfile(userId)
        }, 0)
      } else {
        setProfile(null)
        setMigrationMissing(false)
      }
    })
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      loading,
      migrationMissing,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      },
      async signOut() {
        await supabase.auth.signOut()
      },
      async refreshProfile() {
        if (session?.user) {
          await applyProfile(session.user.id)
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, profile, loading, migrationMissing],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>')
  return v
}
