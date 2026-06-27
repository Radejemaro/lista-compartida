import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Share2, ShoppingCart, Undo2, HelpCircle, Search, X, Mic, GripVertical } from 'lucide-react'
import { ShoppingList } from '../components/ShoppingList'
import { AddItemBar } from '../components/AddItemBar'
import { ShareSheet } from '../components/ShareSheet'
import { ThemeToggle } from '../components/ThemeToggle'
import { OnboardingHint } from '../components/OnboardingHint'
import { useVoice } from '../hooks/useVoice'
import { useSpeak } from '../hooks/useSpeak'
import type { ListItem } from '../types'
import { cn } from '../lib/utils'

interface ListPageProps {
  items: ListItem[]
  peers: number
  listId: string | null
  onAdd: (name: string) => boolean
  onToggle: (id: string) => void
  onAdjust: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onReorder: (orderedIds: string[]) => void
  onLeave: () => void
}

export function ListPage({ items, peers, listId, onAdd, onToggle, onAdjust, onRemove, onReorder, onLeave }: ListPageProps) {
  const [sharing, setSharing] = useState(false)
  const [undoName, setUndoName] = useState<string | null>(null)
  const undoItem = useRef<string | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { speak } = useSpeak()
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('onboardingDone'))
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // ponytail: feature discovery hints — one-shot localStorage flags
  const [voiceHint, setVoiceHint] = useState(() => !localStorage.getItem('voiceHintDone'))
  const [reorderHint, setReorderHint] = useState(() => !localStorage.getItem('reorderHintDone'))
  const [searchHint, setSearchHint] = useState(() => !localStorage.getItem('searchHintDone'))

  const rawActive = items.filter(i => !i.checked).length
  const rawTotal = items.length

  // Show voice hint after first item added, dismiss after 3 items
  useEffect(() => {
    if (voiceHint && rawTotal >= 1 && rawTotal < 4) {
      const t = setTimeout(() => {
        setVoiceHint(false)
        localStorage.setItem('voiceHintDone', 'true')
      }, 5000)
      return () => clearTimeout(t)
    }
    if (rawTotal >= 4) {
      setVoiceHint(false)
      localStorage.setItem('voiceHintDone', 'true')
    }
  }, [rawTotal, voiceHint])

  // Show reorder hint at 3+ items
  useEffect(() => {
    if (reorderHint && rawTotal >= 3) {
      const t = setTimeout(() => {
        setReorderHint(false)
        localStorage.setItem('reorderHintDone', 'true')
      }, 6000)
      return () => clearTimeout(t)
    }
  }, [rawTotal, reorderHint])

  // Show search hint at 6+ items
  useEffect(() => {
    if (searchHint && rawTotal >= 6) {
      setShowSearch(true)
      const t = setTimeout(() => {
        setSearchHint(false)
        localStorage.setItem('searchHintDone', 'true')
      }, 4000)
      return () => clearTimeout(t)
    }
  }, [rawTotal, searchHint])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase().trim()
    return items.filter(i => i.name.toLowerCase().includes(q))
  }, [items, search])

  const activeCount = filteredItems.filter(i => !i.checked).length
  const totalCount = filteredItems.length

  const totalEstimate = useMemo(() => {
    const sum = items.reduce((acc, i) => acc + (i.price ?? 0), 0)
    return sum > 0
      ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(sum)
      : null
  }, [items])

  useEffect(() => {
    if (showOnboarding && rawActive > 0) {
      setShowOnboarding(false)
      localStorage.setItem('onboardingDone', 'true')
    }
  }, [rawActive, showOnboarding])

  const onQueryMissing = useCallback(() => {
    const pending = items.filter(i => !i.checked).map(i => i.name)
    if (pending.length === 0) {
      speak('No hay nada pendiente. La lista está vacía.')
      return
    }
    speak(`Falta${pending.length > 1 ? 'n' : ''}: ${pending.join(', ')}`)
  }, [items, speak])

  const { isListening, isSupported, permissionDenied, toggleListening } = useVoice({
    onItemAdd: onAdd,
    onQueryMissing,
  })

  const handleRemove = useCallback((id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      undoItem.current = item.name
      setUndoName(item.name)
      onRemove(id)
      if (undoTimer.current) clearTimeout(undoTimer.current)
      undoTimer.current = setTimeout(() => {
        setUndoName(null)
        undoItem.current = null
      }, 4000)
    }
  }, [items, onRemove])

  const handleUndo = useCallback(() => {
    if (undoItem.current) onAdd(undoItem.current)
    setUndoName(null)
    undoItem.current = null
    if (undoTimer.current) clearTimeout(undoTimer.current)
  }, [onAdd])

  const checkedCount = rawTotal - rawActive
  const pct = rawTotal > 0 ? Math.round((checkedCount / rawTotal) * 100) : 0

  return (
    <div className="min-h-dvh flex flex-col">
      {/* thin connection bar */}
      <div className={cn(
        'h-0.5 transition-all duration-500',
        peers > 0 ? 'bg-[var(--accent)]/60' : 'bg-[var(--border)]',
      )} />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[var(--bg-base)]/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={onLeave}
              className="min-w-[44px] min-h-[44px] -ml-2 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
              aria-label="Volver a listas"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0 flex items-center gap-2">
              <h1 className="text-base font-semibold truncate">Lista Compartida</h1>
              {rawTotal > 0 && (
                <span className="text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap tabular-nums">
                  {pct}%
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {/* Search toggle */}
            <button
              onClick={() => setShowSearch(v => !v)}
              className={cn(
                'min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center transition-colors',
                showSearch
                  ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]',
              )}
              aria-label={showSearch ? 'Ocultar búsqueda' : 'Buscar productos'}
            >
              <Search size={18} />
            </button>

            {isSupported && (
              <button
                onClick={() => onQueryMissing()}
                className="min-w-[44px] min-h-[44px] rounded-lg flex items-center gap-1.5 px-2 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                aria-label="Escuchar qué falta"
                title="Escuchar qué falta"
              >
                <HelpCircle size={18} />
                <span className="hidden sm:inline text-xs font-medium">¿Qué falta?</span>
              </button>
            )}

            <ThemeToggle />

            <button
              onClick={() => setSharing(true)}
              className="min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
              aria-label="Compartir lista"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Search bar (collapsible) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-2 max-w-lg mx-auto w-full">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar productos..."
                  autoFocus
                  className={cn(
                    'w-full h-10 pl-9 pr-8 rounded-xl text-sm',
                    'bg-[var(--bg-elevated)] text-[var(--text-primary)]',
                    'border border-[var(--border)]',
                    'placeholder:text-[var(--text-tertiary)]',
                    'focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20',
                    'transition-all duration-200',
                  )}
                  aria-label="Buscar productos"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    aria-label="Limpiar búsqueda"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <main className="flex-1 overflow-y-auto pt-2 pb-4 max-w-lg mx-auto w-full">
        {totalCount > 0 && (
          <div className="px-4 pb-3 flex items-center justify-between text-xs text-[var(--text-tertiary)]" role="status" aria-live="polite">
            <span>
              {peers > 0 ? `${peers} conectado${peers !== 1 ? 's' : ''} · ` : ''}
              {totalCount} artículo{totalCount !== 1 ? 's' : ''} · {activeCount} pendiente{activeCount !== 1 ? 's' : ''}
              {search && ' · filtrados'}
            </span>
          </div>
        )}
        <ShoppingList
          items={filteredItems}
          onToggle={onToggle}
          onAdjust={onAdjust}
          onRemove={handleRemove}
          onReorder={onReorder}
        />

        {/* Summary card */}
        {rawTotal > 0 && (
          <div className="px-4 pt-1 pb-2 space-y-2">
            {totalEstimate && (
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm">
                <span className="text-[var(--text-secondary)]">Total estimado</span>
                <span className="font-semibold text-[var(--accent)]">{totalEstimate}</span>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
              <span>{rawTotal} artículo{rawTotal !== 1 ? 's' : ''}</span>
              <span>{checkedCount} comprado{checkedCount !== 1 ? 's' : ''}</span>
              <span>{rawActive} pendiente{rawActive !== 1 ? 's' : ''}</span>
              {peers > 0 && <span>{peers} conectado{peers !== 1 ? 's' : ''}</span>}
            </div>
          </div>
        )}
      </main>

      {/* Feature discovery hints */}
      <AnimatePresence>
        {voiceHint && rawTotal > 0 && rawTotal < 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[calc(3.5rem+env(safe-area-inset-top,0px)+0.5rem)] left-1/2 -translate-x-1/2 z-30"
          >
            <div className="px-4 py-2 rounded-full bg-[var(--bg-surface)] border border-[var(--accent)]/30 text-sm shadow-lg flex items-center gap-2">
              <Mic size={14} className="text-[var(--accent)]" />
              <span className="text-[var(--text-primary)]">Di <strong className="text-[var(--accent)]">"agrega leche"</strong> en el micrófono</span>
            </div>
          </motion.div>
        )}
        {reorderHint && rawTotal >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[calc(3.5rem+env(safe-area-inset-top,0px)+2.5rem)] left-1/2 -translate-x-1/2 z-30"
          >
            <div className="px-4 py-2 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-sm shadow-lg flex items-center gap-2">
              <GripVertical size={14} className="text-[var(--text-tertiary)]" />
              <span className="text-[var(--text-primary)]">Arrastra para reordenar</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add bar */}
      <AddItemBar
        onAdd={onAdd}
        onVoiceToggle={isSupported ? toggleListening : undefined}
        isListening={isListening}
        permissionDenied={permissionDenied}
      />

      {/* Onboarding */}
      {showOnboarding && items.length === 0 && (
        <OnboardingHint onDismiss={() => {
          setShowOnboarding(false)
          localStorage.setItem('onboardingDone', 'true')
        }} />
      )}

      {/* Voice indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[calc(3.5rem+env(safe-area-inset-top,0px)+0.5rem)] left-1/2 -translate-x-1/2 z-30"
          >
            <div className="px-4 py-2 rounded-full bg-[var(--accent)] text-white text-sm font-medium shadow-lg flex items-center gap-2">
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                Escuchando
              </motion.span>
              <span className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="w-1 h-1 rounded-full bg-white"
                    animate={{ height: [4, 8, 4] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Undo snackbar */}
      <AnimatePresence>
        {undoName && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto z-40"
          >
            <button
              onClick={handleUndo}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-base)] text-sm shadow-lg"
            >
              <Undo2 size={16} />
              <span>Producto eliminado: <strong>{undoName}</strong>. Toca para deshacer</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share sheet */}
      <ShareSheet
        open={sharing}
        onClose={() => setSharing(false)}
        listId={listId}
        peers={peers}
      />
    </div>
  )
}
