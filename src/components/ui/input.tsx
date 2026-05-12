import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, icon, className, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[var(--color-text-muted)]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={twMerge(
            'w-full h-10 rounded-[var(--radius-sm)] px-3',
            'bg-[var(--color-bg-glass-hi)] border border-[var(--color-border)]',
            'text-[var(--color-text-primary)] text-[13px] font-[var(--font-body)]',
            'placeholder:text-[var(--color-text-subtle)]',
            'outline-none transition-all duration-150',
            'focus:border-[var(--color-border-strong)] focus:bg-[var(--color-bg-glass-active)] focus:shadow-[0_0_0_3px_var(--color-brand-soft)]',
            error && 'border-[var(--color-negative)] focus:border-[var(--color-negative)] focus:shadow-[0_0_0_3px_var(--color-negative-soft)]',
            icon && 'pl-9',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-[var(--color-negative)]">{error}</p>}
    </div>
  )
})
