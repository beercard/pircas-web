import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Botones del diseño PIRCAS: mayúsculas 12px con tracking, esquinas rectas.
 * Los botones "llenos" usan la forma de puerta (`rounded-door`: semicírculo a la derecha).
 */
export const buttonVariants = cva(
  'inline-flex items-center gap-3.5 text-label font-medium whitespace-nowrap uppercase transition-colors duration-250 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        /** Terracota → grafito (sobre fondos claros) */
        primary: 'rounded-door bg-brand text-white hover:bg-ink hover:text-white',
        /** Terracota → blanco (sobre fotos y fondos oscuros) */
        'primary-on-dark': 'rounded-door bg-brand text-white hover:bg-white hover:text-ink',
        /** Grafito → terracota */
        dark: 'rounded-door bg-ink text-white hover:bg-brand hover:text-white',
        /** Blanco → grafito (sobre terracota) */
        light: 'rounded-door bg-white text-ink hover:bg-ink hover:text-white',
        /** Contorno grafito, recto */
        outline: 'border border-ink text-ink hover:bg-ink hover:text-white',
        /** Contorno claro, recto (sobre fotos y fondos oscuros) */
        'outline-light':
          'border border-white/50 text-white hover:border-white hover:bg-white/10 hover:text-white',
        /** Enlace subrayado */
        link: 'border-b border-current px-0 py-1.5 text-ink hover:border-brand hover:text-brand',
        'link-light':
          'border-b border-current px-0 py-1.5 text-white hover:border-brand-soft hover:text-brand-soft',
      },
      size: {
        sm: 'min-h-12 px-6 text-[0.6875rem]',
        md: 'min-h-14 px-7',
        lg: 'min-h-[3.75rem] px-[1.875rem]',
      },
      /** Ocupa el ancho disponible con la flecha al extremo (CTAs del hero). */
      stretch: { true: 'w-full justify-between sm:w-auto sm:flex-[1_1_15rem]' },
    },
    compoundVariants: [{ variant: ['link', 'link-light'], className: 'min-h-0 self-start px-0' }],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
export type ButtonVariant = NonNullable<ButtonVariantProps['variant']>

/** Traduce el estilo elegido en el CMS al variante adecuado según el fondo. */
export function variantForBackground(
  appearance: 'primary' | 'secondary' | 'outline' | 'link' | null | undefined,
  dark: boolean,
  brandBg = false,
): ButtonVariant {
  switch (appearance ?? 'primary') {
    case 'primary':
      return brandBg ? 'light' : dark ? 'primary-on-dark' : 'primary'
    case 'secondary':
      return dark ? 'light' : 'dark'
    case 'outline':
      return dark ? 'outline-light' : 'outline'
    case 'link':
      return dark ? 'link-light' : 'link'
  }
}
