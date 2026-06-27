import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium',
        'transition-all duration-200 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        'disabled:opacity-50 disabled:pointer-events-none',
        'touch-manipulation select-none',
        variant === 'primary' && 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]',
        variant === 'ghost' && 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
        variant === 'danger' && 'bg-[var(--danger)] text-white hover:opacity-90',
        size === 'sm' && 'h-11 px-3 text-sm gap-1.5',
        size === 'md' && 'h-11 px-4 text-sm gap-2',
        size === 'lg' && 'h-13 px-6 text-base gap-2',
        className,
      )}
      {...props}
    />
  ),
)
