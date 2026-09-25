/**
 * Política de contraseñas del panel. Se aplica al crear un usuario, al cambiar la contraseña
 * y al restablecerla (hook `beforeOperation` de Usuarios), así que cubre todos los caminos.
 */

export const PASSWORD_MIN_LENGTH = 10

/** Palabras que no alcanzan como contraseña aunque se les agreguen números. */
const GUESSABLE = [
  'password',
  'contrasena',
  'clave',
  'qwerty',
  'admin',
  'administrador',
  'pircas',
  'aberturas',
  'coronda',
]

const normalize = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

/** Devuelve el problema de la contraseña (en español) o null si cumple la política. */
export function passwordProblem(password: string, email?: string | null): string | null {
  if (password.length < PASSWORD_MIN_LENGTH)
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`
  if (!/\p{L}/u.test(password) || !/\d/.test(password))
    return 'La contraseña debe combinar letras y números.'

  const plain = normalize(password)
  const letters = plain.replace(/[^a-z]/g, '')
  if (
    GUESSABLE.includes(letters) ||
    /^(.)\1+$/.test(plain) ||
    /^(0?123456789?|abcdefg)/.test(plain)
  )
    return 'Esa contraseña es muy fácil de adivinar. Probá con una frase o combinación propia.'

  const user = normalize(email?.split('@')[0] ?? '')
  if (user.length >= 4 && plain.includes(user)) return 'La contraseña no puede contener tu email.'

  return null
}
