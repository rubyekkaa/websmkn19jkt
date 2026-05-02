import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Film,
  Upload,
} from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { VideoEmbed } from './extensions/VideoEmbed'
import { parseVideoUrl } from '../lib/videoEmbed'
import { supabase } from '../lib/supabase'

type Props = {
  value: string
  onChange: (html: string) => void
}

const VIDEO_BUCKET = 'post-videos'
const MAX_VIDEO_MB = 50

export function RichTextEditor({ value, onChange }: Props) {
  const fileInputId = useId()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      VideoEmbed,
    ],
    content: value || '<p></p>',
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-gray max-w-none min-h-64 focus:outline-none px-4 py-4 prose-headings:font-display',
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (!editor) return null

  function btn(
    onClick: () => void,
    active: boolean,
    Icon: typeof Bold,
    label: string,
    disabled = false,
  ) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={label}
        aria-label={label}
        className={`rounded p-1.5 text-sm transition ${
          active
            ? 'bg-brand-50 text-brand-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <Icon className="h-4 w-4" />
      </button>
    )
  }

  function handleVideoUrl() {
    const ed = editor
    if (!ed) return
    const url = window.prompt(
      'Tempel URL video (YouTube, Vimeo, Google Drive, Facebook, atau .mp4):',
    )
    if (!url) return
    const parsed = parseVideoUrl(url)
    if (!parsed) {
      window.alert('URL tidak dikenali. Pakai link YouTube/Vimeo/Drive/Facebook atau file .mp4 langsung.')
      return
    }
    ed.chain().focus().setVideoEmbed(parsed).run()
  }

  async function handleUploadFile(file: File) {
    setUploadError(null)
    if (!file.type.startsWith('video/')) {
      setUploadError('File harus berupa video.')
      return
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setUploadError(`Ukuran file maksimal ${MAX_VIDEO_MB} MB.`)
      return
    }
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'mp4'
      const path = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`
      const { error: upErr } = await supabase.storage
        .from(VIDEO_BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type })
      if (upErr) throw upErr
      const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path)
      editor
        .chain()
        .focus()
        .setVideoEmbed({ kind: 'file', src: data.publicUrl, provider: 'file' })
        .run()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah video.'
      setUploadError(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        {btn(
          () => editor.chain().focus().toggleBold().run(),
          editor.isActive('bold'),
          Bold,
          'Bold',
        )}
        {btn(
          () => editor.chain().focus().toggleItalic().run(),
          editor.isActive('italic'),
          Italic,
          'Italic',
        )}
        {btn(
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          editor.isActive('heading', { level: 2 }),
          Heading2,
          'Heading 2',
        )}
        {btn(
          () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          editor.isActive('heading', { level: 3 }),
          Heading3,
          'Heading 3',
        )}
        {btn(
          () => editor.chain().focus().toggleBulletList().run(),
          editor.isActive('bulletList'),
          List,
          'Bullet list',
        )}
        {btn(
          () => editor.chain().focus().toggleOrderedList().run(),
          editor.isActive('orderedList'),
          ListOrdered,
          'Ordered list',
        )}
        {btn(
          () => editor.chain().focus().toggleBlockquote().run(),
          editor.isActive('blockquote'),
          Quote,
          'Blockquote',
        )}
        {btn(
          () => {
            const url = window.prompt('URL gambar:')
            if (url) editor.chain().focus().setImage({ src: url }).run()
          },
          false,
          ImageIcon,
          'Gambar dari URL',
        )}
        {btn(
          () => {
            const prev = editor.getAttributes('link').href as string | undefined
            const url = window.prompt('URL link:', prev ?? 'https://')
            if (url === null) return
            if (url === '') editor.chain().focus().unsetLink().run()
            else
              editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: url })
                .run()
          },
          editor.isActive('link'),
          LinkIcon,
          'Link',
        )}
        <span className="mx-1 h-5 w-px bg-gray-200" />
        {btn(
          handleVideoUrl,
          false,
          Film,
          'Video dari URL (YouTube / Vimeo / Drive / Facebook / .mp4)',
        )}
        <label
          htmlFor={fileInputId}
          title={
            uploading
              ? 'Mengunggah video…'
              : `Upload video (maks ${MAX_VIDEO_MB} MB)`
          }
          aria-label={
            uploading
              ? 'Mengunggah video…'
              : `Upload video (maks ${MAX_VIDEO_MB} MB)`
          }
          className={`rounded p-1.5 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 ${
            uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          <Upload className="h-4 w-4" />
        </label>
        <input
          id={fileInputId}
          type="file"
          accept="video/*"
          disabled={uploading}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleUploadFile(file)
            e.target.value = ''
          }}
        />
        <span className="mx-1 h-5 w-px bg-gray-200" />
        {btn(
          () => editor.chain().focus().undo().run(),
          false,
          Undo2,
          'Undo',
        )}
        {btn(
          () => editor.chain().focus().redo().run(),
          false,
          Redo2,
          'Redo',
        )}
      </div>
      {(uploading || uploadError) && (
        <div
          className={`border-b border-gray-200 px-3 py-2 text-xs ${
            uploadError
              ? 'bg-rose-50 text-rose-700'
              : 'bg-blue-50 text-blue-700'
          }`}
        >
          {uploadError ?? 'Mengunggah video, mohon tunggu…'}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
