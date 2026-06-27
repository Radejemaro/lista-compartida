import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => (
    <div className="relative flex-1">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full h-12 px-4 rounded-xl text-base',
          'bg-[var(--bg-surface)] text-[var(--text-primary)]',
          'border border-[var(--border)]',
          'placeholder:text-[var(--text-tertiary)]',
          'transition-all duration-200',
          'focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20',
          'disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  ),
)
