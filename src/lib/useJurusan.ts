import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { JURUSAN as FALLBACK } from '../data/jurusan'
import type { Jurusan } from '../types'

/**
 * Fetch daftar jurusan dari Supabase. Saat fetch error (mis. tabel belum
 * dibuat) atau hasil kosong, fallback ke data statis di `data/jurusan.ts`
 * supaya halaman publik tidak blank sebelum admin run SQL migrasi.
 */
export function useJurusan(): {
  items: Jurusan[]
  loading: boolean
  error: string | null
} {
  const [items, setItems] = useState<Jurusan[]>(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error: err } = await supabase
        .from('jurusan')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
      if (cancelled) return
      if (err) {
        setError(err.message)
        setItems(FALLBACK)
      } else if (!data || data.length === 0) {
        setItems(FALLBACK)
      } else {
        setItems(data as Jurusan[])
      }
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return { items, loading, error }
}
