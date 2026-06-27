import { motion, useReducedMotion } from 'framer-motion'

const guides = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="7" width="22" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 12h22" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="18" r="1.5" fill="currentColor" />
        <path d="M20 18h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 18h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Escribe o habla',
    desc: 'Usa el teclado o di "agrega leche" con el micrófono',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 22c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M25 8h-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Comparte el enlace',
    desc: 'Envía el enlace a tu familia y todos ven la misma lista',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 14l3.5 3.5L19 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <motion.path
          d="M10 7A7 7 0 0118 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ pathLength: [0, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    ),
    title: 'Se sincroniza solo',
    desc: 'Los cambios aparecen al instante en todos los dispositivos',
  },
]

export function EmptyState() {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduced ? undefined : { staggerChildren: 0.12 }}
      className="flex flex-col items-center py-16 px-6"
    >
      {/* decorative header */}
      <div className="relative mb-10">
        <svg width="100" height="80" viewBox="0 0 100 80" fill="none" aria-hidden="true">
          <rect x="20" y="10" width="60" height="44" rx="8" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" fill="var(--accent-soft)" fillOpacity="0.5" />
          <path d="M35 28h30" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <path d="M35 36h20" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <motion.path
            d="M32 50l-8 8 16 16 28-28"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 text-wrap-balance">
        Tu lista está vacía
      </h2>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {guides.map(g => (
          <motion.div
            key={g.title}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-[var(--shadow-sm)]"
          >
            <span className="text-[var(--accent)] flex-shrink-0">
              {g.icon}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium text-[var(--text-primary)]">{g.title}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">{g.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
