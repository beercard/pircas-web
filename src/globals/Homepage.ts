import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { ALL_BLOCKS } from '@/blocks/configs'
import { revalidateGlobalHook } from '@/hooks/revalidate'
import { previewPathFor } from '@/lib/preview'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Home',
  admin: {
    group: 'Contenido',
    description:
      'Secciones de la página de inicio. Arrastrá para reordenar. Para esconder una sección sin borrarla: "Ajustes de la sección → Ocultar esta sección" (o solo en ciertos dispositivos con "Ocultar en").',
    livePreview: { url: () => previewPathFor('home') },
    preview: () => previewPathFor('home'),
  },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'sections',
      label: 'Secciones',
      labels: { singular: 'Sección', plural: 'Secciones' },
      type: 'blocks',
      blocks: ALL_BLOCKS,
      admin: { initCollapsed: true },
    },
  ],
  hooks: { afterChange: [revalidateGlobalHook('homepage')] },
  versions: { drafts: { autosave: { interval: 800 } }, max: 50 },
}
