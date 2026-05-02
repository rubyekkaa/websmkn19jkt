export type VideoEmbed =
  | { kind: 'iframe'; src: string; provider: VideoProvider }
  | { kind: 'file'; src: string }

export type VideoProvider =
  | 'youtube'
  | 'vimeo'
  | 'drive'
  | 'facebook'
  | 'unknown'

const YOUTUBE_RE =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d{5,})/i
const DRIVE_RE = /drive\.google\.com\/file\/d\/([A-Za-z0-9_-]{10,})/i
const FACEBOOK_RE = /(?:facebook\.com|fb\.watch)\//i
const DIRECT_VIDEO_RE = /\.(mp4|webm|ogg|mov)(?:\?.*)?$/i

export function parseVideoUrl(input: string): VideoEmbed | null {
  const url = input.trim()
  if (!url) return null

  const yt = url.match(YOUTUBE_RE)
  if (yt) {
    return {
      kind: 'iframe',
      provider: 'youtube',
      src: `https://www.youtube.com/embed/${yt[1]}`,
    }
  }

  const vm = url.match(VIMEO_RE)
  if (vm) {
    return {
      kind: 'iframe',
      provider: 'vimeo',
      src: `https://player.vimeo.com/video/${vm[1]}`,
    }
  }

  const dr = url.match(DRIVE_RE)
  if (dr) {
    return {
      kind: 'iframe',
      provider: 'drive',
      src: `https://drive.google.com/file/d/${dr[1]}/preview`,
    }
  }

  if (FACEBOOK_RE.test(url)) {
    const encoded = encodeURIComponent(url)
    return {
      kind: 'iframe',
      provider: 'facebook',
      src: `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false`,
    }
  }

  if (DIRECT_VIDEO_RE.test(url) || url.startsWith('blob:')) {
    return { kind: 'file', src: url }
  }

  // Last resort: try as direct URL anyway (could be an .mp4 without obvious extension)
  if (/^https?:\/\//i.test(url)) {
    return { kind: 'iframe', provider: 'unknown', src: url }
  }

  return null
}
