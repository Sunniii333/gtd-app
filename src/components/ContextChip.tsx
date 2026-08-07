interface ContextChipProps {
  label: string
  onRemove?: () => void
}

export function ContextChip({ label, onRemove }: ContextChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-canvas px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-muted hover:text-ink"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
