import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import slugify from 'slugify'
import { ArrowLeft, ImageIcon, Save, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { RichTextEditor } from '../../components/RichTextEditor'
import type { Category, PostStatus, Tag } from '../../types'

type FormState = {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_url: string
  category_id: string | null
  status: PostStatus
  tag_ids: string[]
}

const EMPTY: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '<p></p>',
  cover_url: '',
  category_id: null,
  status: 'draft',
  tag_ids: [],
}

export function AdminBeritaForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState<FormState>(EMPTY)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touchedSlug, setTouchedSlug] = useState(false)

  useEffect(() => {
    async function loadMeta() {
      const [c, t] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('tags').select('*').order('name'),
      ])
      setCategories((c.data ?? []) as Category[])
      setTags((t.data ?? []) as Tag[])
    }
    void loadMeta()
  }, [])

  useEffect(() => {
    if (!isEdit || !id) return
    async function loadPost() {
      const { data, error: err } = await supabase
        .from('posts')
        .select('*, tags:post_tags(tag_id)')
        .eq('id', id)
        .maybeSingle()
      if (err || !data) {
        setError(err?.message ?? 'Berita tidak ditemukan.')
        setLoading(false)
        return
      }
      setForm({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? '',
        content: data.content ?? '<p></p>',
        cover_url: data.cover_url ?? '',
        category_id: data.category_id,
        status: data.status,
        tag_ids: ((data.tags ?? []) as { tag_id: string }[]).map(
          (t) => t.tag_id,
        ),
      })
      setTouchedSlug(true)
      setLoading(false)
    }
    void loadPost()
  }, [id, isEdit])

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function onTitleChange(value: string) {
    set('title', value)
    if (!touchedSlug) {
      set(
        'slug',
        slugify(value, { lower: true, strict: true, locale: 'id' }),
      )
    }
  }

  async function onUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user?.id ?? 'anon'}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('post-images')
        .upload(path, file, { upsert: false, contentType: file.type })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('post-images').getPublicUrl(path)
      set('cover_url', data.publicUrl)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`Gagal mengunggah: ${msg}`)
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (!form.title.trim()) throw new Error('Judul wajib diisi.')
      if (!form.slug.trim()) throw new Error('Slug wajib diisi.')

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim() || null,
        content: form.content,
        cover_url: form.cover_url || null,
        category_id: form.category_id || null,
        author_id: user?.id ?? null,
        status: form.status,
        published_at:
          form.status === 'published' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }

      let postId = id
      if (isEdit && id) {
        const { error: err } = await supabase
          .from('posts')
          .update(payload)
          .eq('id', id)
        if (err) throw err
      } else {
        const { data, error: err } = await supabase
          .from('posts')
          .insert(payload)
          .select('id')
          .single()
        if (err) throw err
        postId = data.id
      }

      if (postId) {
        await supabase.from('post_tags').delete().eq('post_id', postId)
        if (form.tag_ids.length > 0) {
          await supabase
            .from('post_tags')
            .insert(
              form.tag_ids.map((tid) => ({ post_id: postId, tag_id: tid })),
            )
        }
      }

      navigate('/admin/berita')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Memuat…</div>
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/admin/berita"
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-brand-600"
          >
            <ArrowLeft className="h-3 w-3" /> Daftar Berita
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Berita' : 'Berita Baru'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value as PostStatus)}
            className="rounded-full border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Terbit</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? (
              'Menyimpan…'
            ) : (
              <>
                <Save className="h-4 w-4" /> Simpan
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Field label="Judul">
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="block w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
              placeholder="Misal: Upacara HUT RI ke-80"
            />
          </Field>
          <Field label="Slug" hint="URL berita: /berita/<slug>">
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => {
                setTouchedSlug(true)
                set('slug', e.target.value)
              }}
              className="block w-full rounded-lg border-gray-300 font-mono text-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </Field>
          <Field label="Ringkasan" hint="Tampil di kartu berita.">
            <textarea
              rows={3}
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              className="block w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
              placeholder="1-2 kalimat ringkasan berita."
            />
          </Field>
          <Field label="Isi Berita">
            <RichTextEditor
              value={form.content}
              onChange={(html) => set('content', html)}
            />
          </Field>
        </div>

        <aside className="space-y-6">
          <Field label="Cover">
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
              {form.cover_url ? (
                <div>
                  <img
                    src={form.cover_url}
                    alt="cover"
                    className="aspect-[16/10] w-full rounded object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => set('cover_url', '')}
                    className="mt-2 w-full rounded text-xs text-red-600 hover:underline"
                  >
                    Hapus cover
                  </button>
                </div>
              ) : (
                <div className="grid place-items-center py-8">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-xs text-gray-500">
                    Belum ada gambar cover.
                  </p>
                </div>
              )}
              <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-brand-500">
                <Upload className="h-3.5 w-3.5" />
                {uploading ? 'Mengunggah…' : 'Upload gambar'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void onUpload(f)
                    e.currentTarget.value = ''
                  }}
                />
              </label>
              <input
                type="url"
                value={form.cover_url}
                onChange={(e) => set('cover_url', e.target.value)}
                placeholder="atau tempel URL gambar"
                className="mt-2 block w-full rounded-lg border-gray-300 text-xs focus:border-brand-500 focus:ring-brand-500"
              />
            </div>
          </Field>

          <Field label="Kategori">
            <select
              value={form.category_id ?? ''}
              onChange={(e) => set('category_id', e.target.value || null)}
              className="block w-full rounded-lg border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500"
            >
              <option value="">— Pilih kategori —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-2 text-xs text-gray-500">
                Belum ada kategori.{' '}
                <Link
                  to="/admin/kategori"
                  className="text-brand-600 hover:underline"
                >
                  Tambah dulu
                </Link>
                .
              </p>
            )}
          </Field>

          <Field label="Tag">
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 && (
                <p className="text-xs text-gray-500">
                  Belum ada tag.{' '}
                  <Link
                    to="/admin/tag"
                    className="text-brand-600 hover:underline"
                  >
                    Tambah dulu
                  </Link>
                  .
                </p>
              )}
              {tags.map((t) => {
                const checked = form.tag_ids.includes(t.id)
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() =>
                      set(
                        'tag_ids',
                        checked
                          ? form.tag_ids.filter((x) => x !== t.id)
                          : [...form.tag_ids, t.id],
                      )
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      checked
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t.name}
                  </button>
                )
              })}
            </div>
          </Field>
        </aside>
      </div>
    </form>
  )
}

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
