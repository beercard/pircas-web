import type { SerializedLinkNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  LinkJSXConverter,
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'

import { cn } from '@/lib/cn'
import { pathFor, type RoutableCollection } from '@/lib/routes'

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const doc = linkNode.fields.doc
  if (!doc) return '#'
  const { relationTo, value } = doc
  const slug = typeof value === 'object' && value && 'slug' in value ? String(value.slug) : null
  return slug ? pathFor(relationTo as RoutableCollection, slug) : '#'
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
})

type Props = {
  data: SerializedEditorState | null | undefined
  className?: string
}

/** Texto enriquecido del CMS (Lexical) renderizado como HTML semántico en el servidor. */
export function RichText({ data, className }: Props) {
  if (!data?.root?.children?.length) return null
  return (
    <LexicalRichText
      data={data}
      converters={converters}
      className={cn('prose-pircas', className)}
    />
  )
}
