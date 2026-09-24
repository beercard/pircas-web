import type { CollectionConfig } from 'payload'

import { ROLES, selfOrSuperAdmin, superAdmin, superAdminField } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  admin: {
    group: 'Sistema',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'updatedAt'],
    description:
      'Personas con acceso al panel. Solo un super-admin puede crear usuarios y cambiar roles.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 8, // 8 h
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
  },
  access: {
    admin: ({ req: { user } }) => Boolean(user),
    create: superAdmin,
    read: selfOrSuperAdmin,
    update: selfOrSuperAdmin,
    delete: superAdmin,
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    {
      name: 'role',
      label: 'Rol',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: ROLES.map((r) => ({
        value: r,
        label: r === 'super-admin' ? 'Super administrador' : 'Editor',
      })),
      access: {
        // Solo un super-admin puede asignar o cambiar roles.
        create: superAdminField,
        update: superAdminField,
      },
      admin: {
        position: 'sidebar',
        description:
          'Editor: contenido, catálogo, proyectos, imágenes, SEO y consultas. Super administrador: además usuarios, analítica y configuración del sistema.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      // El primer usuario creado (onboarding) siempre es super-admin.
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        if (totalDocs === 0) return { ...data, role: 'super-admin' }
        return data
      },
    ],
  },
}
