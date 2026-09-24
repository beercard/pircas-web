import Link from 'next/link'

export function AdvisorBlockNote() {
  return (
    <p style={{ margin: '0.5rem 0 1rem', color: 'var(--theme-elevation-600)' }}>
      Las preguntas, respuestas y recomendaciones del asesor se editan en{' '}
      <Link href="/admin/globals/advisor">Configuración → Asesor virtual</Link>.
    </p>
  )
}
