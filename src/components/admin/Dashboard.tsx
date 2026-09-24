import type { CollectionSlug, ServerProps } from 'payload'

import type { Lead } from '@/payload-types'
import { labelFor, LEAD_STATUSES } from '@/lib/options'

const QUICK_ACTIONS = [
  { label: 'Nuevo producto', href: '/admin/collections/products/create' },
  { label: 'Nuevo proyecto', href: '/admin/collections/projects/create' },
  { label: 'Nueva línea', href: '/admin/collections/product-lines/create' },
  { label: 'Nuevo contenido', href: '/admin/collections/pages/create' },
  { label: 'Ver consultas', href: '/admin/collections/leads' },
  { label: 'Editar home', href: '/admin/globals/homepage' },
]

const DRAFTABLE: CollectionSlug[] = ['products', 'product-lines', 'projects', 'pages']

function LeadTable({ title, leads, href }: { title: string; leads: Lead[]; href: string }) {
  return (
    <section className="pircas-dash__card pircas-dash__card--wide">
      <header className="pircas-dash__card-head">
        <h3>{title}</h3>
        <a href={href}>Ver todas →</a>
      </header>
      {leads.length === 0 ? (
        <p className="pircas-dash__empty">Todavía no hay registros.</p>
      ) : (
        <table className="pircas-dash__table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Contacto</th>
              <th>Obra</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>
                  <a href={`/admin/collections/leads/${l.id}`}>{l.fullName || l.name}</a>
                </td>
                <td>{l.phone || l.email}</td>
                <td>{l.projectType || '—'}</td>
                <td>
                  <span className={`pircas-dash__status pircas-dash__status--${l.status}`}>
                    {labelFor(LEAD_STATUSES, l.status)}
                  </span>
                </td>
                <td>{new Date(l.createdAt).toLocaleDateString('es-AR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

/** Panel de inicio del admin: consultas recientes, contenido publicado y accesos rápidos. */
export async function Dashboard({ payload, user }: ServerProps) {
  if (!user) return null

  const [contacts, quotes, newLeads, products, projects, ...drafts] = await Promise.all([
    payload.find({
      collection: 'leads',
      where: { type: { equals: 'contact' } },
      limit: 5,
      depth: 0,
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'leads',
      where: { type: { equals: 'quotation' } },
      limit: 5,
      depth: 0,
      sort: '-createdAt',
    }),
    payload.count({ collection: 'leads', where: { status: { equals: 'new' } } }),
    payload.count({ collection: 'products', where: { _status: { equals: 'published' } } }),
    payload.count({ collection: 'projects', where: { _status: { equals: 'published' } } }),
    ...DRAFTABLE.map((collection) =>
      payload.count({ collection, where: { _status: { equals: 'draft' } } }),
    ),
  ])

  const draftTotal = drafts.reduce((acc, d) => acc + d.totalDocs, 0)

  const stats = [
    {
      label: 'Consultas nuevas',
      value: newLeads.totalDocs,
      href: '/admin/collections/leads?where[status][equals]=new',
    },
    {
      label: 'Productos publicados',
      value: products.totalDocs,
      href: '/admin/collections/products',
    },
    {
      label: 'Proyectos publicados',
      value: projects.totalDocs,
      href: '/admin/collections/projects',
    },
    {
      label: 'Contenido en borrador',
      value: draftTotal,
      href: '/admin/collections/products?where[_status][equals]=draft',
    },
  ]

  return (
    <div className="pircas-dash">
      <h2 className="pircas-dash__title">
        Hola, {'name' in user && user.name ? String(user.name) : 'equipo PIRCAS'} 👋
      </h2>

      <nav className="pircas-dash__actions" aria-label="Accesos rápidos">
        {QUICK_ACTIONS.map((a) => (
          <a key={a.href} href={a.href} className="pircas-dash__action">
            {a.label}
          </a>
        ))}
      </nav>

      <div className="pircas-dash__stats">
        {stats.map((s) => (
          <a key={s.label} href={s.href} className="pircas-dash__card pircas-dash__stat">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </a>
        ))}
      </div>

      <div className="pircas-dash__grid">
        <LeadTable
          title="Últimas cotizaciones"
          leads={quotes.docs}
          href="/admin/collections/leads?where[type][equals]=quotation"
        />
        <LeadTable
          title="Últimas consultas"
          leads={contacts.docs}
          href="/admin/collections/leads?where[type][equals]=contact"
        />
      </div>
    </div>
  )
}
