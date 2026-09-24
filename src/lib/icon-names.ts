/**
 * Íconos disponibles para editores en el CMS (beneficios, pasos, características).
 * La lista es pura para poder usarse en la config de Payload sin cargar React.
 * El mapeo a componentes está en `components/ui/Icon.tsx`.
 */
export const ICON_OPTIONS = [
  { value: 'ruler', label: 'Regla / medida' },
  { value: 'home', label: 'Casa' },
  { value: 'building', label: 'Edificio' },
  { value: 'store', label: 'Local comercial' },
  { value: 'briefcase', label: 'Oficina' },
  { value: 'wrench', label: 'Herramienta' },
  { value: 'hammer', label: 'Martillo' },
  { value: 'factory', label: 'Fábrica' },
  { value: 'truck', label: 'Envío' },
  { value: 'message-circle', label: 'Consulta' },
  { value: 'shield-check', label: 'Seguridad / garantía' },
  { value: 'lock', label: 'Cerradura' },
  { value: 'thermometer', label: 'Aislación térmica' },
  { value: 'volume-x', label: 'Aislación acústica' },
  { value: 'sun', label: 'Luz / sol' },
  { value: 'droplets', label: 'Agua' },
  { value: 'wind', label: 'Aire / hermeticidad' },
  { value: 'sparkles', label: 'Diseño / estética' },
  { value: 'layers', label: 'Capas / DVH' },
  { value: 'square', label: 'Ventana' },
  { value: 'door-open', label: 'Puerta' },
  { value: 'badge-check', label: 'Calidad' },
  { value: 'clock', label: 'Tiempo' },
  { value: 'map-pin', label: 'Ubicación' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'coins', label: 'Precio' },
  { value: 'settings', label: 'Mecanismo' },
  { value: 'package', label: 'Paquete' },
  { value: 'star', label: 'Destacado' },
  { value: 'check', label: 'Tilde' },
] as const

export type IconName = (typeof ICON_OPTIONS)[number]['value']
