import { LivePreviewListener } from './LivePreviewListener'

/** Aviso visible solo para editores en modo vista previa (borradores). */
export function DraftModeBanner() {
  return (
    <>
      <div role="status" className="relative z-[55] bg-brand text-center text-sm text-white">
        <div className="container-site flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2">
          <span className="font-semibold">Vista previa: estás viendo contenido en borrador.</span>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- es un route handler: requiere navegación completa */}
          <a href="/next/exit-preview" className="underline underline-offset-4 hover:no-underline">
            Salir de la vista previa
          </a>
        </div>
      </div>
      <LivePreviewListener />
    </>
  )
}
