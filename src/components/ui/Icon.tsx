import {
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  Clock,
  Coins,
  DoorOpen,
  Droplets,
  Factory,
  Hammer,
  House,
  Layers,
  Lock,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Ruler,
  Settings,
  ShieldCheck,
  Sparkles,
  Square,
  Star,
  Store,
  Sun,
  Thermometer,
  Truck,
  VolumeX,
  Wind,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

import type { IconName } from '@/lib/icon-names'

const ICONS: Record<IconName, LucideIcon> = {
  ruler: Ruler,
  home: House,
  building: Building2,
  store: Store,
  briefcase: Briefcase,
  wrench: Wrench,
  hammer: Hammer,
  factory: Factory,
  truck: Truck,
  'message-circle': MessageCircle,
  'shield-check': ShieldCheck,
  lock: Lock,
  thermometer: Thermometer,
  'volume-x': VolumeX,
  sun: Sun,
  droplets: Droplets,
  wind: Wind,
  sparkles: Sparkles,
  layers: Layers,
  square: Square,
  'door-open': DoorOpen,
  'badge-check': BadgeCheck,
  clock: Clock,
  'map-pin': MapPin,
  phone: Phone,
  coins: Coins,
  settings: Settings,
  package: Package,
  star: Star,
  check: Check,
}

type IconProps = { name?: string | null; className?: string; strokeWidth?: number }

/** Ícono elegido desde el CMS. Decorativo (aria-hidden): el texto adyacente da el significado. */
export function Icon({ name, className, strokeWidth = 1.5 }: IconProps) {
  const Component = name && name in ICONS ? ICONS[name as IconName] : null
  if (!Component) return null
  return <Component aria-hidden="true" className={className} strokeWidth={strokeWidth} />
}
