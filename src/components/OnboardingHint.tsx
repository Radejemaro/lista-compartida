import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface OnboardingHintProps {
  onDismiss: () => void
}

export function OnboardingHint({ onDismiss }: OnboardingHintProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-28 left-4 right-4 max-w-lg mx-auto z-40"
    >
      <div className="relative bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4 shadow-[var(--shadow-lg)]">
        {/* Arrow pointing down to the input bar */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[var(--bg-surface)] border-r border-b border-[var(--border)]" />

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-[var(--accent)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              Di <strong className="text-[var(--accent)]">"agrega leche"</strong> en el micrófono,
              toca un producto para marcarlo, y usa <strong>?</strong> para escuchar qué falta.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={onDismiss}
                className="text-xs font-medium text-[var(--accent)] hover:underline"
              >
                Entendido
              </button>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Cerrar sugerencia"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
