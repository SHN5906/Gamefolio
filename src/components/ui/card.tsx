import { twMerge } from 'tailwind-merge'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
  interactive?: boolean
}

export function Card({ elevated, interactive, className, children, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        'rounded-[var(--radius)] border relative overflow-hidden',
        'backdrop-blur-xl',
        elevated
          ? 'bg-[var(--color-bg-glass-hi)] border-[var(--color-border-strong)]'
          : 'bg-[var(--color-bg-glass)] border-[var(--color-border)]',
        interactive && 'card-lift cursor-pointer',
        className
      )}
      style={{
        boxShadow: elevated ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        ...props.style,
      }}
      {...props}
    >
      {/* Subtle inner highlight on top edge */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
      />
      {children}
    </div>
  )
}
