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
} from 'lucide-react'
import { useEffect } from 'react'

type Props = {
  value: string
  onChange: (html: string) => void
}

export function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
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
  ) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={label}
        aria-label={label}
        className={`rounded p-1.5 text-sm transition ${
          active
            ? 'bg-brand-50 text-brand-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <Icon className="h-4 w-4" />
      </button>
    )
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
      <EditorContent editor={editor} />
    </div>
  )
}
