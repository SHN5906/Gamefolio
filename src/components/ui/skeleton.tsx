import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-[var(--radius-sm)]', className)}
      style={{ background: 'var(--color-bg-glass-hi)' }}
    />
  )
}
