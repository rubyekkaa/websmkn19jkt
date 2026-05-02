import { Node, mergeAttributes } from '@tiptap/core'

export type VideoEmbedKind = 'iframe' | 'file'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (attrs: {
        kind: VideoEmbedKind
        src: string
        provider?: string
      }) => ReturnType
    }
  }
}

export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      kind: {
        default: 'iframe',
        parseHTML: (element) =>
          element.tagName === 'VIDEO' ? 'file' : 'iframe',
      },
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('src'),
      },
      provider: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'iframe[data-video-embed]' },
      { tag: 'video[data-video-embed]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { kind, src, provider, ...rest } = HTMLAttributes
    if (kind === 'file') {
      return [
        'video',
        mergeAttributes(rest, {
          'data-video-embed': '',
          'data-provider': provider ?? 'file',
          src,
          controls: 'true',
          playsinline: 'true',
          preload: 'metadata',
          style:
            'width:100%;max-width:100%;border-radius:0.75rem;background:#000',
        }),
      ]
    }
    // iframe (YouTube, Vimeo, Drive, Facebook, etc.)
    return [
      'div',
      {
        'data-video-embed-wrapper': '',
        style:
          'position:relative;width:100%;padding-top:56.25%;border-radius:0.75rem;overflow:hidden;background:#000;margin:1rem 0',
      },
      [
        'iframe',
        mergeAttributes(rest, {
          'data-video-embed': '',
          'data-provider': provider ?? 'iframe',
          src,
          frameborder: '0',
          allow:
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
          allowfullscreen: 'true',
          loading: 'lazy',
          referrerpolicy: 'strict-origin-when-cross-origin',
          style:
            'position:absolute;inset:0;width:100%;height:100%;border:0',
        }),
      ],
    ]
  },

  addCommands() {
    return {
      setVideoEmbed:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          })
        },
    }
  },
})
