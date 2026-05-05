import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { EKSKUL as FALLBACK } from '../data/ekskul'
import type { Ekskul } from '../types'

/**
 * Fetch daftar ekskul dari Supabase. Saat fetch error (mis. tabel belum
 * dibuat) atau hasil kosong, fallback ke data statis di `data/ekskul.ts`
 * supaya halaman publik tidak blank sebelum admin run SQL migrasi.
 */
export function useEkskul(): {
  items: Ekskul[]
  loading: boolean
  error: string | null
} {
  const [items, setItems] = useState<Ekskul[]>(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error: err } = await supabase
        .from('ekskul')
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
        setItems(data as Ekskul[])
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
