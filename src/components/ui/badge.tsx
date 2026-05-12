import { twMerge } from 'tailwind-merge'
import type { Condition } from '@/types/db'

// Badge générique
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'positive' | 'negative' | 'warning' | 'blue'
}

const variantStyles = {
  default:  'bg-[var(--color-bg-glass-hi)] text-[var(--color-text-muted)]',
  positive: 'bg-[var(--color-positive-soft)] text-[var(--color-positive)]',
  negative: 'bg-[var(--color-negative-soft)] text-[var(--color-negative)]',
  warning:  'bg-[rgba(245,158,11,0.12)] text-[var(--color-warning)]',
  blue:     'bg-[var(--color-blue-soft)] text-[var(--color-blue)]',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center px-1.5 py-px rounded-[3px]',
        'font-[var(--font-mono)] text-[9px] font-semibold tracking-[0.3px]',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// Badge spécifique pour l'état d'une carte
const conditionVariant: Record<Condition, BadgeProps['variant']> = {
  NM: 'positive',
  EX: 'warning',
  GD: 'warning',
  PL: 'negative',
  PO: 'negative',
}

export function ConditionBadge({ condition }: { condition: Condition }) {
  return <Badge variant={conditionVariant[condition]}>{condition}</Badge>
}
