import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { VideoBlock as VideoBlockData } from '@/payload-types'
import { mediaSrc } from '@/lib/media'
import { toEmbedUrl } from '@/lib/video'

import { VideoPlayer } from './VideoPlayer'

export function VideoBlock({
  eyebrow,
  title,
  intro,
  url,
  poster,
  aspect,
  settings,
}: VideoBlockData) {
  const embed = toEmbedUrl(url)
  if (!embed) return null
  const posterUrl =
    poster && typeof poster === 'object' ? mediaSrc(poster.sizes?.desktop?.url ?? poster.url) : null
  return (
    <Section settings={settings} defaultSpacing="sm">
      <div className="container-site flex flex-col gap-8">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} size="md" />
        <VideoPlayer
          embedUrl={embed}
          title={title || 'Video'}
          poster={posterUrl}
          aspect={aspect ?? '16/9'}
        />
      </div>
    </Section>
  )
}
