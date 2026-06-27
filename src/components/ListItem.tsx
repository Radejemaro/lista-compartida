import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Minus, Plus, AlertTriangle, StickyNote, DollarSign, Clock } from 'lucide-react'
import type { ListItem } from '../types'
import { cn } from '../lib/utils'

interface ListItemProps {
  item: ListItem
  onToggle: (id: string) => void
  onAdjust: (id: string, delta: number) => void
  onRemove: (id: string) => void
}

export function ListItemRow({ item, onToggle, onAdjust, onRemove }: ListItemProps) {
  const { quantity: qty, bought, checked } = item
  const isPartial = !checked && bought > 0 && bought < qty
  const isExact = checked && bought >= qty && bought === qty
  const isExcess = checked && bought > qty
  const hasQty = qty > 1
  const hasNote = !!item.note
  const hasPrice = item.price != null
  const hasHistory = item.updatedAt && item.updatedBy

  const [hint, setHint] = useState(false)
  useEffect(() => {
    if (hasQty && !checked && bought === 0 && !localStorage.getItem('qtyHint')) {
      localStorage.setItem('qtyHint', '1')
      setHint(true)
      const t = setTimeout(() => setHint(false), 3500)
      return () => clearTimeout(t)
    }
  }, [hasQty, checked, bought])

  const historyLabel = hasHistory
    ? `Actualizado ${timeAgo(item.updatedAt!)}`
    : null

  const priceLabel = hasPrice
    ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.price!)
    : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{
        opacity: checked ? 0.65 : 1,
        y: 0,
        scale: 1,
      }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      }}
      className={cn(
        'group relative flex items-start gap-3 px-4 py-3.5 rounded-2xl',
        'bg-[var(--bg-surface)] border shadow-[var(--shadow-sm)]',
        'transition-all duration-200',
        'select-none touch-manipulation',
        isPartial || isExcess
          ? 'border-amber-500/30 bg-amber-50 dark:bg-amber-950/10'
          : 'border-[var(--border)]',
        isExact && 'border-[var(--accent)]/30',
      )}
    >
      {/* Check circle */}
      <button
        onClick={e => {
          e.stopPropagation()
          onToggle(item.id)
          navigator.vibrate?.(5)
        }}
        className={cn(
          'flex-shrink-0 w-11 h-11 -mt-2 -ml-2 rounded-full flex items-center justify-center',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)]',
          'transition-all duration-300',
        )}
        aria-label={checked ? `Marcar ${item.name} como pendiente` : `Marcar ${item.name} como comprado`}
        aria-checked={checked}
        role="checkbox"
      >
        <div
          className={cn(
            'w-7 h-7 rounded-full border-2 flex items-center justify-center',
            'transition-all duration-300 pointer-events-none',
            isExact && 'bg-[var(--accent)] border-[var(--accent)]',
            isExcess && 'bg-[var(--accent)] border-[var(--accent)]',
            isPartial && 'border-amber-500 bg-amber-500/10',
            !isPartial && !isExact && !isExcess && 'border-[var(--text-tertiary)]',
          )}
        >
          {isExact && (
            <motion.svg
              width="14" height="14" viewBox="0 0 14 14"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <motion.path
                d="M2 7 L6 11 L12 3"
                fill="none" stroke="white" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            </motion.svg>
          )}
          {isExcess && (
            <AlertTriangle size={12} className="text-white" />
          )}
          {isPartial && (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          )}
        </div>
      </button>

      {/* Stepper */}
      {hasQty && (
        <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
          <button
            onClick={e => { e.stopPropagation(); onAdjust(item.id, -1) }}
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center',
              'text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
              'transition-all duration-150 active:scale-90',
              bought === 0 && 'opacity-0 pointer-events-none',
            )}
            aria-label="Restar uno"
          >
            <Minus size={14} />
          </button>

          <span
            className={cn(
              'min-w-[32px] h-7 px-1.5 rounded-lg font-bold text-xs flex items-center justify-center',
              'transition-all duration-200',
              isExact && 'bg-[var(--accent-soft)] text-[var(--accent)]',
              isExcess && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
              isPartial && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
              !isPartial && !isExact && !isExcess && bought === 0 && 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
            )}
          >
            {isExcess
              ? `${qty}+${bought - qty}`
              : isPartial
                ? `${bought}/${qty}`
                : String(qty)
            }
          </span>

          <button
            onClick={e => { e.stopPropagation(); onAdjust(item.id, 1) }}
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center',
              'text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
              'transition-all duration-150 active:scale-90',
            )}
            aria-label="Agregar uno"
          >
            <Plus size={14} />
          </button>
        </div>
      )}

      {/* Name + meta */}
      <div className="flex-1 min-w-0 pt-0.5">
        <span
          className={cn(
            'text-base transition-all duration-300 block truncate',
            checked && 'line-through text-[var(--text-secondary)]',
          )}
        >
          {item.name}
        </span>

        {/* Note + Price grid */}
        {(hasNote || hasPrice) && (
          <div className={cn(
            'mt-0.5 gap-x-3',
            hasNote && hasPrice ? 'grid grid-cols-2' : 'flex items-center gap-3',
          )}>
            {hasNote && (
              <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] min-w-0">
                <StickyNote size={11} className="flex-shrink-0" />
                <span className="truncate">{item.note}</span>
              </div>
            )}
            {hasPrice && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-[var(--accent)]">
                <DollarSign size={10} />
                {priceLabel}
              </span>
            )}
          </div>
        )}

        {/* History */}
        {historyLabel && !hasNote && !hasPrice && (
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[var(--text-tertiary)]">
            <Clock size={9} />
            {historyLabel}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {isPartial && (
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--border)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(bought / qty) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Hint toast */}
      {hint && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: -4 }}
          exit={{ opacity: 0 }}
          className="absolute -top-8 left-4 px-2 py-1 rounded-md bg-[var(--text-primary)] text-[var(--bg-base)] text-[10px] whitespace-nowrap shadow-md z-10"
        >
          Toca + o − para ajustar
          <div className="absolute -bottom-1 left-4 w-2 h-2 rotate-45 bg-[var(--text-primary)]" />
        </motion.div>
      )}

      {/* Delete — always visible on mobile via @media, subtle on desktop */}
      <button
        onClick={e => {
          e.stopPropagation()
          onRemove(item.id)
        }}
        className={cn(
          'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5',
          'text-[var(--text-tertiary)]/60 hover:text-[var(--danger)] hover:bg-[var(--danger)]/10',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]',
          'transition-all duration-200 active:scale-90',
        )}
        aria-label={`Eliminar ${item.name}`}
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  )
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.round(hrs / 24)
  return `hace ${days}d`
}
