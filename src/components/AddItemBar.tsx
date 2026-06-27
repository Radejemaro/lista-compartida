import { useState, type FormEvent, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Mic, MicOff, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react'
import { cn } from '../lib/utils'

interface AddItemBarProps {
  onAdd: (name: string) => boolean
  onVoiceToggle?: () => void
  isListening?: boolean
  permissionDenied?: boolean
}

const PLACEHOLDERS = ['¿Qué necesitas?', 'leche', 'huevos', 'pan', 'manteca', 'fruta']

export function AddItemBar({ onAdd, onVoiceToggle, isListening, permissionDenied }: AddItemBarProps) {
  const [value, setValue] = useState('')
  const [phIndex, setPhIndex] = useState(0)
  const [duplicate, setDuplicate] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dupTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const timer = setInterval(() => {
      setPhIndex(i => (i + 1) % PLACEHOLDERS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isListening) inputRef.current?.focus()
  }, [isListening])

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    if (!value.trim()) return
    const added = onAdd(value.trim())
    if (added) {
      setValue('')
      navigator.vibrate?.(10)
    } else {
      setDuplicate(value.trim())
      clearTimeout(dupTimer.current)
      dupTimer.current = setTimeout(() => setDuplicate(null), 2500)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 left-0 right-0 z-10"
    >
      {/* Focus hint */}
      <AnimatePresence>
        {focused && !value && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="px-4 pb-2 max-w-lg mx-auto"
          >
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
              <Sparkles size={11} />
              <span>Di <strong className="text-[var(--accent)]">"agrega leche"</strong> o <strong className="text-[var(--accent)]">"5 lechugas"</strong></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)] to-transparent">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={PLACEHOLDERS[phIndex]}
              className={cn(
                'w-full h-15 px-5 rounded-2xl text-base',
                'bg-[var(--bg-surface)] text-[var(--text-primary)]',
                'border-2 border-[var(--border)]',
                'placeholder:text-[var(--text-tertiary)] placeholder:transition-opacity placeholder:duration-300',
                'transition-all duration-200',
                'focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20',
                isListening && 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30',
                duplicate && 'border-[var(--danger)] ring-2 ring-[var(--danger)]/20',
              )}
              autoComplete="off"
              aria-label="Nuevo producto"
            />
            <AnimatePresence>
              {duplicate && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute -top-7 left-0 right-0 flex items-center gap-1 text-xs text-[var(--danger)]"
                >
                  <AlertCircle size={12} />
                  <span>Ya está en la lista</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {onVoiceToggle && (
            <motion.button
              type="button"
              onClick={() => {
                if (permissionDenied) return
                onVoiceToggle()
                if (!isListening && navigator.vibrate) navigator.vibrate(10)
              }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'h-15 w-15 rounded-2xl flex items-center justify-center',
                'transition-all duration-200',
                permissionDenied
                  ? 'bg-[var(--danger)]/10 text-[var(--danger)] border-2 border-[var(--danger)]/30 cursor-not-allowed'
                  : isListening
                    ? 'bg-[var(--accent)] text-white shadow-[var(--shadow-md)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-2 border-[var(--border)] hover:border-[var(--accent)]/40',
              )}
              aria-label={
                permissionDenied
                  ? 'Micrófono bloqueado'
                  : isListening
                    ? 'Detener dictado'
                    : 'Agregar por voz'
              }
              title={
                permissionDenied
                  ? 'Permiso denegado — revisa la configuración del navegador'
                  : isListening
                      ? 'Toca para detener'
                    : 'Agregar por voz'
              }
            >
              {permissionDenied ? (
                <AlertTriangle size={20} />
              ) : isListening ? (
                <MicOff size={20} />
              ) : (
                <Mic size={20} />
              )}
            </motion.button>
          )}

          <motion.button
            type="submit"
            disabled={!value.trim()}
            whileTap={{ scale: value.trim() ? 0.9 : 1 }}
            className={cn(
              'h-15 w-15 rounded-2xl flex items-center justify-center',
              'bg-[var(--accent)] text-white',
              'transition-all duration-200',
              'disabled:opacity-30 disabled:scale-100',
            )}
            aria-label="Agregar producto"
          >
            <Plus size={24} />
          </motion.button>
        </div>
      </div>
    </form>
  )
}
