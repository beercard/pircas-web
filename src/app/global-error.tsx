'use client'

/** Error crítico (falla el layout raíz). HTML mínimo sin dependencias. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es-AR">
      <body
        style={{
          margin: 0,
          fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
          background: '#FAF9F7',
          color: '#26272B',
        }}
      >
        <main style={{ maxWidth: 640, margin: '0 auto', padding: '96px 20px' }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: '.32em',
              textTransform: 'uppercase',
              color: '#B8502C',
            }}
          >
            Error
          </p>
          <h1 style={{ fontWeight: 500, fontSize: 40, lineHeight: 1.05, letterSpacing: '-.03em' }}>
            El sitio no está disponible en este momento.
          </h1>
          <p style={{ color: '#5F6066', lineHeight: 1.6 }}>Probá de nuevo en unos minutos.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              padding: '16px 26px',
              border: 0,
              background: '#B8502C',
              color: '#fff',
              borderRadius: '0 999px 999px 0',
              cursor: 'pointer',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              fontSize: 12,
            }}
          >
            Reintentar
          </button>
          {error.digest && <p style={{ fontSize: 12, color: '#5F6066' }}>Código: {error.digest}</p>}
        </main>
      </body>
    </html>
  )
}
