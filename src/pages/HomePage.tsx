import { useState, type FormEvent, useEffect, useRef, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ShoppingCart, ChevronRight, Share2, PencilLine, CheckCheck, Mic, RefreshCw, Users, Search, X, Plus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import type { ListMeta } from '../types'
import { cn } from '../lib/utils'

interface HomePageProps {
  onCreate: () => void
  onJoin: (id: string) => void
  savedLists: ListMeta[]
  onSelectList: (id: string) => void
  onRenameList?: (id: string, name: string) => void
}

export function HomePage({ onCreate, onJoin, savedLists, onSelectList, onRenameList }: HomePageProps) {
  const [joinId, setJoinId] = useState('')
  const reduced = useReducedMotion()
  const joinInput = useRef<HTMLInputElement>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInput = useRef<HTMLInputElement>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [listSearch, setListSearch] = useState('')
  const hasLists = savedLists.length > 0

  const filteredLists = useMemo(() => {
    if (!listSearch.trim()) return savedLists
    const q = listSearch.toLowerCase().trim()
    return savedLists.filter(l => l.name.toLowerCase().includes(q))
  }, [savedLists, listSearch])

  useEffect(() => {
    joinInput.current?.focus()
  }, [])

  useEffect(() => {
    if (renaming) renameInput.current?.focus()
  }, [renaming])

  // ponytail: focus the list search if there are many lists
  useEffect(() => {
    if (savedLists.length >= 4) {
      // subtle: search auto-focuses only on desktop-width
    }
  }, [savedLists])

  function handleJoin(e: FormEvent) {
    e.preventDefault()
    if (joinId.trim()) onJoin(joinId.trim())
  }

  function startRename(e: React.MouseEvent, id: string, currentName: string) {
    e.stopPropagation()
    setRenaming(id)
    setRenameValue(currentName)
  }

  function commitRename(id: string) {
    const name = renameValue.trim()
    if (name && onRenameList) onRenameList(id, name)
    setRenaming(null)
  }

  async function shareList(list: ListMeta) {
    const link = `${window.location.origin}/?join=${list.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Lista de compras', text: `Agrega productos a la lista "${list.name}"`, url: link })
        return
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(link)
      setCopiedId(list.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch { /* fallback */ }
  }

  const features = [
    { icon: Mic, title: 'Agrega por voz', desc: 'Di "agrega leche" y aparece al instante' },
    { icon: Share2, title: 'Comparte al instante', desc: 'Toda tu familia ve la misma lista' },
    { icon: RefreshCw, title: 'Se sincroniza solo', desc: 'Sin cuentas, sin registros, sin esfuerzo' },
  ]

  // --- New user view ---
  if (!hasLists) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
        <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-[var(--border)] opacity-30" style={{ transform: 'translate(30%, -20%)' }} />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full border border-[var(--border)] opacity-20" style={{ transform: 'translate(-20%, 10%)' }} />
          <div className="absolute top-1/3 left-1/4 w-20 h-20 rounded-full border border-[var(--border)] opacity-15" />
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center max-w-sm w-full relative z-1"
        >
          {reduced ? (
            <div className="w-20 h-20 rounded-3xl bg-[var(--accent-soft)] flex items-center justify-center mb-8">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect x="6" y="10" width="24" height="18" rx="3" stroke="var(--accent)" strokeWidth="2" />
                <path d="M6 16h24" stroke="var(--accent)" strokeWidth="2" />
                <path d="M20 22h6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 22h3" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-6"
            >
              <svg width="72" height="72" viewBox="0 0 80 80" fill="none" aria-hidden="true">
                <motion.rect x="16" y="20" width="48" height="34" rx="6" stroke="var(--accent)" strokeWidth="2.5" fill="var(--accent-soft)" fillOpacity="0.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }} />
                <motion.path d="M16 30h48" stroke="var(--accent)" strokeWidth="2" opacity="0.4" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }} style={{ transformOrigin: '40px 30px' }} />
                <motion.path d="M30 42l6 6 14-14" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }} />
                <motion.circle cx="64" cy="18" r="10" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, delay: 0.8, ease: 'easeOut' }} />
                <motion.path d="M60 18l3 3 5-6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 1.2, ease: 'easeOut' }} />
              </svg>
            </motion.div>
          )}

          <h1 className="text-2xl font-bold text-center mb-2">Lista Compartida</h1>
          <p className="text-sm text-[var(--text-secondary)] text-center mb-8 max-w-xs">
            Compra en equipo, sincronizado al instante. Sin cuentas ni registros.
          </p>

          {/* Feature cards */}
          <div className="w-full flex flex-col gap-2 mb-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.3, ease: 'easeOut' }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
                  <f.icon size={16} className="text-[var(--accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{f.title}</div>
                  <div className="text-xs text-[var(--text-tertiary)]">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <Button size="lg" onClick={onCreate} className="w-full mb-4 text-base">
            <Plus size={18} />
            Crear mi primera lista
          </Button>

          <div className="flex items-center gap-3 w-full mb-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-tertiary)]">o unirse a una existente</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <form onSubmit={handleJoin} className="flex gap-2 w-full">
            <input
              ref={joinInput}
              type="text"
              value={joinId}
              onChange={e => setJoinId(e.target.value)}
              placeholder="Código de lista"
              className="flex-1 h-12 px-4 rounded-xl text-sm bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              aria-label="Código de lista para unirse"
            />
            <Button type="submit" disabled={!joinId.trim()}>Unirse</Button>
          </form>
        </motion.div>
      </div>
    )
  }

  // --- Returning user view ---
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Compact header */}
      <header className="sticky top-0 z-20 bg-[var(--bg-base)]/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
              <ShoppingCart size={16} className="text-[var(--accent)]" />
            </div>
            <h1 className="text-base font-semibold">Lista Compartida</h1>
          </div>
          <Button size="sm" onClick={onCreate}>
            <Plus size={15} />
            Crear
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full pt-4 px-4 pb-4">
        {/* Search filter */}
        {savedLists.length >= 3 && (
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={listSearch}
              onChange={e => setListSearch(e.target.value)}
              placeholder="Buscar listas..."
              className="w-full h-10 pl-9 pr-8 rounded-xl text-sm bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200"
              aria-label="Buscar listas"
            />
            {listSearch && (
              <button
                onClick={() => setListSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                aria-label="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Section title */}
        <h2 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-1">
          {filteredLists.length === savedLists.length
            ? `Tus listas (${savedLists.length})`
            : `${filteredLists.length} de ${savedLists.length} listas`
          }
        </h2>

        {/* List cards */}
        <div className="flex flex-col gap-2">
          {filteredLists.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">
              {listSearch ? `Sin resultados para "${listSearch}"` : 'Todavía no tienes listas'}
            </div>
          ) : (
            filteredLists.map((list, i) => (
              <motion.button
                key={list.id}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25, ease: 'easeOut' }}
                onClick={() => onSelectList(list.id)}
                className={cn(
                  'group flex items-center gap-3 w-full px-4 py-3.5 rounded-xl',
                  'bg-[var(--bg-surface)] border border-[var(--border)]',
                  'shadow-[var(--shadow-sm)] hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)]',
                  'transition-all duration-200 text-left active:scale-[0.98]',
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
                  <ShoppingCart size={18} className="text-[var(--accent)]" />
                </div>

                <div className="flex-1 min-w-0">
                  {renaming === list.id ? (
                    <input
                      ref={renameInput}
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={() => commitRename(list.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitRename(list.id)
                        if (e.key === 'Escape') setRenaming(null)
                      }}
                      onClick={e => e.stopPropagation()}
                      maxLength={30}
                      className="text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-elevated)] rounded px-1.5 py-1 w-full outline-none ring-2 ring-[var(--accent)]/40"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {list.name}
                      </span>
                      <button
                        onClick={e => startRename(e, list.id, list.name)}
                        className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all duration-150"
                        aria-label={`Renombrar ${list.name}`}
                      >
                        <PencilLine size={12} />
                      </button>
                    </div>
                  )}
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    {new Date(list.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <button
                  onClick={e => { e.stopPropagation(); shareList(list) }}
                  className={cn(
                    'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
                    'text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]',
                    'transition-all duration-150',
                  )}
                  aria-label={`Compartir ${list.name}`}
                >
                  {copiedId === list.id
                    ? <CheckCheck size={16} className="text-[var(--accent)]" />
                    : <Share2 size={16} />
                  }
                </button>

                <ChevronRight size={18} className="text-[var(--text-tertiary)] flex-shrink-0" />
              </motion.button>
            ))
          )}
        </div>

        {/* Join form */}
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-tertiary)]">o unirse a otra lista</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>
          <form onSubmit={handleJoin} className="flex gap-2 w-full">
            <input
              type="text"
              value={joinId}
              onChange={e => setJoinId(e.target.value)}
              placeholder="Código de lista"
              className="flex-1 h-12 px-4 rounded-xl text-sm bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              aria-label="Código de lista para unirse"
            />
            <Button type="submit" disabled={!joinId.trim()}>Unirse</Button>
          </form>
        </div>
      </main>
    </div>
  )
}
