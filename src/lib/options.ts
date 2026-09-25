/** Opciones de negocio compartidas entre CMS, formularios y asesor virtual. */

export const LEAD_STATUSES = [
  { value: 'new', label: 'Nueva' },
  { value: 'contacted', label: 'Contactada' },
  { value: 'qualified', label: 'Calificada' },
  { value: 'quoted', label: 'Presupuestada' },
  { value: 'won', label: 'Ganada' },
  { value: 'lost', label: 'Perdida' },
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]['value']

export const LEAD_TYPES = [
  { value: 'contact', label: 'Contacto' },
  { value: 'quotation', label: 'Cotización' },
  { value: 'project', label: 'Obra / profesional' },
] as const

export type LeadType = (typeof LEAD_TYPES)[number]['value']

export const labelFor = <T extends { value: string; label: string }>(
  list: readonly T[],
  value: string | null | undefined,
): string => list.find((o) => o.value === value)?.label ?? value ?? ''
