interface ContextChipProps {
  label: string
  onRemove?: () => void
}

export function ContextChip({ label, onRemove }: ContextChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-violet-500 hover:text-violet-800 dark:hover:text-violet-100"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
