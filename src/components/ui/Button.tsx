import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { buttonVariants, type ButtonVariantProps } from './button-variants'

export const Arrow = ({ symbol = '→' }: { symbol?: string }) => (
  <span aria-hidden="true">{symbol}</span>
)

type ButtonProps = ComponentProps<'button'> & ButtonVariantProps & { arrow?: boolean | string }

export function Button({
  className,
  variant,
  size,
  stretch,
  arrow,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, stretch }), className)}
      {...props}
    >
      {children}
      {arrow && <Arrow symbol={typeof arrow === 'string' ? arrow : undefined} />}
    </button>
  )
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, 'href'> &
  ButtonVariantProps & { href: string; arrow?: boolean; children: ReactNode }

export function ButtonLink({
  className,
  variant,
  size,
  stretch,
  href,
  arrow,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size, stretch }), className)}
      {...props}
    >
      {children}
      {arrow && <Arrow />}
    </Link>
  )
}
