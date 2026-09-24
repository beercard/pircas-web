import type { SelectField } from 'payload'

import { ICON_OPTIONS } from '@/lib/icon-names'

export const iconField = (overrides: Partial<SelectField> = {}): SelectField =>
  ({
    name: 'icon',
    label: 'Ícono',
    type: 'select',
    options: ICON_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
    ...overrides,
  }) as SelectField
