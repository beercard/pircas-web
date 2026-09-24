import { Gallery } from '@/components/ui/Gallery'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { GalleryBlock as GalleryBlockData } from '@/payload-types'
import { toGalleryImages } from '@/lib/media'

export function GalleryBlock({ eyebrow, title, intro, images, settings }: GalleryBlockData) {
  const items = toGalleryImages(images)
  if (!items.length) return null
  return (
    <Section settings={settings} defaultSpacing="sm">
      <div className="container-site flex flex-col gap-[22px]">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} size="md" />
        <Gallery images={items} />
      </div>
    </Section>
  )
}
