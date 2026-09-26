import type { ButtonHTMLAttributes, ReactNode } from 'react'

export const inputClass =
  'w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none'

export const labelClass = 'block text-xs font-medium uppercase tracking-wide text-muted'

export const chipClass =
  'rounded-full border border-hairline px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANT: Record<Variant, string> = {
  primary:
    'rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas transition-[background-color,transform] hover:opacity-85 active:scale-[0.98] disabled:opacity-40',
  secondary:
    'rounded-md border border-hairline px-3 py-2 text-sm text-ink hover:border-ink disabled:opacity-40',
  ghost: 'rounded-md px-2 py-1 text-xs font-medium text-muted hover:text-ink',
  danger: 'rounded-md px-2 py-1 text-xs font-medium text-pale-red-ink hover:opacity-70',
}

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" {...props} className={`${VARIANT[variant]} ${className}`} />
}

export function Page({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8 sm:py-14">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-serif text-3xl italic tracking-tight text-ink">{title}</h2>
        {action}
      </div>
      {subtitle && <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  )
}

export function SectionTitle({ children, tone }: { children: ReactNode; tone?: 'warn' }) {
  return (
    <h3
      className={`mb-2 mt-8 font-mono text-[11px] uppercase tracking-wide first:mt-0 ${
        tone === 'warn' ? 'text-pale-red-ink' : 'text-muted'
      }`}
    >
      {children}
    </h3>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-10 text-center text-sm text-muted">{children}</p>
}

/** Pill toggle group used for picking a context or an option. */
export function Pills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ${
            value === o.value
              ? 'border-ink bg-ink text-canvas'
              : 'border-hairline text-muted hover:border-ink hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/25 sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-hairline bg-surface p-5 shadow-[0_2px_24px_rgba(0,0,0,0.08)] sm:max-w-lg sm:rounded-xl sm:p-6">
        {children}
      </div>
    </div>
  )
}
