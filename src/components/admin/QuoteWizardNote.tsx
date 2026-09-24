import Link from 'next/link'

export function QuoteWizardNote() {
  return (
    <p style={{ margin: '0.5rem 0 1rem', color: 'var(--theme-elevation-600)' }}>
      Las opciones de cada paso, los mensajes de éxito y los emails se editan en{' '}
      <Link href="/admin/globals/forms-settings">Configuración → Formularios</Link>. Los productos y
      líneas se toman del catálogo.
    </p>
  )
}
