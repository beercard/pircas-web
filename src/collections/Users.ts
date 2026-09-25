import { APIError, ValidationError, type CollectionConfig } from 'payload'

import { ROLES, selfOrSuperAdmin, superAdmin, superAdminField } from '@/access'
import { passwordProblem } from '@/lib/auth/password-policy'
import { clientIp, createRateLimiter } from '@/lib/forms/rate-limit'

/** Intentos de ingreso por IP (además del bloqueo por cuenta de Payload). */
const loginRateLimiter = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 })

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  admin: {
    group: 'Sistema',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'lastLoginAt'],
    description:
      'Personas con acceso al panel. Solo un super administrador puede crear usuarios y cambiar roles.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 8, // la sesión vence a las 8 h
    maxLoginAttempts: 5, // 5 intentos fallidos…
    lockTime: 15 * 60 * 1000, // …bloquean la cuenta 15 minutos
    useSessions: true, // sesiones del lado del servidor: cerrar sesión las invalida
    removeTokenFromResponses: true, // el token viaja solo en la cookie (HttpOnly)
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
          'Editor: contenido, productos, trabajos, fotos y consultas. Super administrador: además usuarios, analítica y configuración.',
      },
    },
    {
      name: 'lastLoginAt',
      label: 'Último acceso',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM/yyyy HH:mm' },
      },
    },
  ],
  hooks: {
    beforeOperation: [
      ({ args, operation, req }) => {
        // Límite de intentos por IP: frena ataques que prueban muchas cuentas a la vez.
        if (operation === 'login') {
          const limit = loginRateLimiter.check(`login:${clientIp(req.headers)}`)
          if (!limit.allowed)
            throw new APIError(
              'Demasiados intentos de ingreso. Esperá unos minutos y volvé a probar.',
              429,
            )
        }
        // Contraseña fuerte al crear, cambiar o restablecer (todos los caminos).
        const data = (args as { data?: { password?: unknown; email?: string } }).data
        const password = data?.password
        if (
          typeof password === 'string' &&
          ['create', 'update', 'resetPassword'].includes(operation)
        ) {
          const problem = passwordProblem(password, data?.email ?? req.user?.email)
          if (problem)
            throw new ValidationError({
              collection: 'users',
              errors: [{ message: problem, path: 'password' }],
            })
        }
        return args
      },
    ],
    beforeChange: [
      // El primer usuario creado (onboarding) siempre es super-admin.
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        if (totalDocs === 0) return { ...data, role: 'super-admin' }
        return data
      },
    ],
    afterLogin: [
      // Registro del último acceso (se ve en Usuarios y en el inicio del panel).
      async ({ req, user }) => {
        await req.payload.update({
          collection: 'users',
          id: user.id,
          data: { lastLoginAt: new Date().toISOString() },
          overrideAccess: true,
          req,
        })
      },
    ],
  },
}
