'use client'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { Copy, ExternalLink, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

type Links = { trackingUrl: string; whatsappUrl: string | null }

/**
 * Acciones rápidas del pedido: avisar al cliente por WhatsApp (con el estado y el enlace de
 * seguimiento ya escritos), abrir el seguimiento que ve el cliente y copiar el enlace.
 */
export function OrderActions() {
  const { id } = useDocumentInfo()
  // Se vuelve a pedir el enlace cuando cambia el estado guardado (el mensaje lo incluye).
  const status = useFormFields(([fields]) => fields.status?.initialValue as string | undefined)
  const payment = useFormFields(
    ([fields]) => fields.paymentStatus?.initialValue as string | undefined,
  )
  const [links, setLinks] = useState<Links | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    const ctrl = new AbortController()
    fetch(`/api/orders/${id}/links`, { credentials: 'include', signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Links | null) => data && setLinks(data))
      .catch(() => {})
    return () => ctrl.abort()
  }, [id, status, payment])

  if (!id || !links) return null

  return (
    <div className="pircas-order-actions">
      <p>
        Al guardar un cambio de estado, el cliente recibe un email. También podés avisarle por
        WhatsApp: el mensaje ya incluye el estado y su enlace de seguimiento.
      </p>
      <div className="pircas-order-actions__row">
        {links.whatsappUrl && (
          <a
            href={links.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pircas-order-actions__btn pircas-order-actions__btn--wa"
          >
            <MessageCircle aria-hidden="true" size={16} /> Avisar por WhatsApp
          </a>
        )}
        <a
          href={links.trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pircas-order-actions__btn"
        >
          <ExternalLink aria-hidden="true" size={16} /> Ver seguimiento del cliente
        </a>
        <button
          type="button"
          className="pircas-order-actions__btn"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(links.trackingUrl)
              setCopied(true)
              setTimeout(() => setCopied(false), 1800)
            } catch {
              // Sin permiso de portapapeles: el enlace se puede abrir y copiar desde el navegador.
            }
          }}
        >
          <Copy aria-hidden="true" size={16} /> {copied ? 'Enlace copiado' : 'Copiar enlace'}
        </button>
      </div>
    </div>
  )
}
