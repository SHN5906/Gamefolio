import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type Variant = 'primary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hi)] shadow-[0_0_20px_var(--color-brand-glow)] hover:shadow-[0_0_28px_var(--color-brand-glow)] hover:-translate-y-px',
  ghost:   'bg-[var(--color-bg-glass)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-glass-hi)] hover:text-[var(--color-text-primary)]',
  danger:  'bg-[var(--color-negative-soft)] text-[var(--color-negative)] border border-[rgba(239,68,68,0.25)] hover:bg-[rgba(239,68,68,0.2)]',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center rounded-[var(--radius-sm)]',
          'font-[var(--font-body)] font-semibold',
          'transition-all duration-150 cursor-pointer',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
          'backdrop-blur-sm',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  )
})
