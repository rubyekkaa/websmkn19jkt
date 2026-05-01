import { useEffect, useState } from 'react'
import slugify from 'slugify'
import { Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Tag } from '../../types'

export function AdminTag() {
  const [items, setItems] = useState<Tag[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('tags').select('*').order('name')
    setItems((data ?? []) as Tag[])
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function onAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const slug = slugify(name, { lower: true, strict: true })
      const { error: err } = await supabase
        .from('tags')
        .insert({ name: name.trim(), slug })
      if (err) throw err
      setName('')
      void load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Hapus tag ini?')) return
    const { error: err } = await supabase.from('tags').delete().eq('id', id)
    if (err) {
      alert(err.message)
      return
    }
    void load()
  }

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Konten
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">
          Tag
        </h1>
      </div>

      <form
        onSubmit={onAdd}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="flex-1 sm:max-w-md">
          <label className="block text-xs font-medium text-gray-700">
            Tambah tag
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Misal: lomba, kunjungan-industri"
            className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          Tambah
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Memuat…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Belum ada tag.
          </div>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {items.map((t) => (
              <li
                key={t.id}
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 py-1 pl-3 pr-1 text-sm text-gray-700"
              >
                {t.name}
                <button
                  type="button"
                  onClick={() => onDelete(t.id)}
                  className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Hapus"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
