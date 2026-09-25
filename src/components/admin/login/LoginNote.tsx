import { LockKeyhole } from 'lucide-react'

/** Nota de seguridad debajo del formulario de ingreso. */
export function LoginNote() {
  return (
    <p className="pircas-login-note">
      <LockKeyhole aria-hidden="true" size={16} />
      <span>
        Conexión segura. Por protección, la cuenta se bloquea 15 minutos después de 5 intentos
        fallidos.
      </span>
    </p>
  )
}
