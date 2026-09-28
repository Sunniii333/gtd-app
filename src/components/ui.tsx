import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

export const inputClass =
  'w-full border border-rule bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-2 focus:outline-offset-1 focus:outline-rule'

export const labelClass = 'block text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted'

export const chipClass =
  'border border-hairline px-1.5 py-px font-mono text-[0.625rem] uppercase tracking-[0.08em] text-muted'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANT: Record<Variant, string> = {
  primary:
    'border border-rule bg-ink px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-canvas transition-transform active:translate-y-px disabled:opacity-40',
  secondary:
    'border border-rule bg-surface px-3 py-2 text-xs uppercase tracking-[0.1em] text-ink hover:bg-ink hover:text-canvas disabled:opacity-40',
  ghost: 'px-2 py-1 text-[0.6875rem] uppercase tracking-[0.1em] text-muted underline-offset-4 hover:text-ink hover:underline',
  danger: 'px-2 py-1 text-[0.6875rem] uppercase tracking-[0.1em] text-pale-red-ink hover:underline',
}

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" {...props} className={`${VARIANT[variant]} ${className}`} />
}

/** Section codes printed in each sheet's header, like the tabs of a flight-data file. */
const SHEETS: Record<string, string> = {
  '': 'IN-01',
  calendar: 'CAL-02',
  next: 'ACT-03',
  waiting: 'WF-04',
  projects: 'PRJ-05',
  someday: 'SM-06',
  reference: 'REF-07',
  review: 'WR-08',
  settings: 'SET-09',
}

function sheetCode(pathname: string) {
  return SHEETS[pathname.split('/')[1] ?? ''] ?? 'GTD'
}

function today() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

/** A document header: code and date in a ruled strip, then the underlined title. */
export function SheetHeader({ title, action }: { title: string; action?: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <>
      <div className="flex border-y border-rule font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted">
        <span className="border-r border-rule px-2 py-1 text-ink">{sheetCode(pathname)}</span>
        <span className="flex-1 px-2 py-1">Getting Things Done</span>
        <span className="border-l border-rule px-2 py-1">Date {today()}</span>
      </div>
      <div className="mt-6 flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold uppercase tracking-[0.14em] text-ink underline decoration-1 underline-offset-[6px] sm:text-2xl">
          {title}
        </h2>
        {action}
      </div>
    </>
  )
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
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-5 sm:px-8 sm:pt-12">
      <SheetHeader title={title} action={action} />
      {subtitle && <p className="mt-3 text-xs leading-relaxed text-muted">{subtitle}</p>}
      <div className="mt-8">{children}</div>
      <p className="mt-10 overflow-hidden whitespace-nowrap text-center font-mono text-[0.625rem] tracking-[0.2em] text-hairline" aria-hidden>
        ************ END OF SHEET ************
      </p>
    </div>
  )
}

/** Centred, boxed heading between two rules — like "SR 83:37" in the checklist. */
export function SectionTitle({ children, tone }: { children: ReactNode; tone?: 'warn' }) {
  const warn = tone === 'warn'
  return (
    <h3 className="mb-2 mt-10 flex items-center gap-2 first:mt-0" aria-label={typeof children === 'string' ? children : undefined}>
      <span className={`h-px flex-1 ${warn ? 'bg-pale-red-ink' : 'bg-rule'}`} />
      <span
        className={
          warn
            ? 'px-1 font-hand text-sm text-pale-red-ink'
            : 'border border-rule px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink'
        }
      >
        {children}
      </span>
      <span className={`h-px flex-1 ${warn ? 'bg-pale-red-ink' : 'bg-rule'}`} />
    </h3>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="py-10 text-center">
      <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-muted">~~ NO ENTRIES ~~</p>
      <p className="mt-2 text-xs text-muted">{children}</p>
    </div>
  )
}

/** Toggle group used for picking a context or an option — boxed like a form field. */
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
          className={`border px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.08em] transition-colors ${
            value === o.value
              ? 'border-rule bg-ink text-canvas'
              : 'border-hairline text-muted hover:border-rule hover:text-ink'
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="paper max-h-[92vh] w-full overflow-y-auto border border-rule p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[5px_5px_0_var(--color-rule)] sm:max-w-lg sm:p-6">
        {children}
      </div>
    </div>
  )
}
