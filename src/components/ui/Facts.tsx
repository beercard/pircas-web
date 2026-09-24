import { cn } from '@/lib/cn'

type Fact = { value: string; label: string; id?: string | null }

/**
 * Datos destacados en grilla con líneas de 1 px (ej: "65 mm · Parantes").
 * `tone` define el fondo de las celdas para que las líneas se vean.
 */
export function Facts({
  facts,
  tone = 'paper',
  size = 'md',
  className,
}: {
  facts?: Fact[] | null
  tone?: 'paper' | 'stone' | 'ink'
  size?: 'md' | 'lg'
  className?: string
}) {
  if (!facts?.length) return null
  const cell = { paper: 'bg-paper', stone: 'bg-stone', ink: 'bg-ink' }[tone]
  const dark = tone === 'ink'
  return (
    <dl
      className={cn(
        'grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-px',
        dark ? 'bg-white/14' : 'bg-line',
        className,
      )}
    >
      {facts.map((f) => (
        <div
          key={f.id ?? f.label}
          className={cn(
            'flex flex-col-reverse gap-2',
            cell,
            size === 'lg' ? 'px-6 py-7' : 'px-[18px] py-5',
          )}
        >
          <dt
            className={cn(
              'text-[0.656rem] leading-normal tracking-[0.2em] uppercase',
              dark ? 'text-white/70' : 'text-muted',
            )}
          >
            {f.label}
          </dt>
          <dd
            className={cn(
              'tracking-[-0.02em]',
              size === 'lg'
                ? 'text-[clamp(1.5rem,1.1rem+1.4vw,2.125rem)]'
                : 'text-[clamp(1.25rem,1rem+0.9vw,1.75rem)]',
              dark ? 'text-brand-soft' : tone === 'stone' ? 'text-brand-ink' : 'text-brand',
            )}
          >
            {f.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
