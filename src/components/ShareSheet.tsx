import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Users, Share2 } from 'lucide-react'
import QRCode from 'qrcode'
import { Button } from './ui/Button'
import { cn } from '../lib/utils'

interface ShareSheetProps {
  open: boolean
  onClose: () => void
  listId: string | null
  peers: number
}

export function ShareSheet({ open, onClose, listId, peers }: ShareSheetProps) {
  const [copied, setCopied] = useState(false)
  const [link, setLink] = useState('')
  const [qrSvg, setQrSvg] = useState('')
  const qrRef = useRef(false)

  useEffect(() => {
    if (listId) {
      const l = `${window.location.origin}/?join=${listId}`
      setLink(l)
      if (!qrRef.current) {
        qrRef.current = true
        QRCode.toString(l, { type: 'svg', margin: 1, color: { dark: '#18181b' } })
          .then(svg => setQrSvg(svg))
          .catch(() => {}) // ponytail: QR failure is non-critical
      }
    }
  }, [listId])

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('textarea')
      input.value = link
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [link])

  const quickShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: 'Lista de compras',
        text: 'Agrega productos a la lista de compras compartida',
        url: link,
      }).catch(() => {}) // ponytail: user cancelled — non-critical
    }
  }, [link])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sheet */}
          <motion.div
            className={cn(
              'relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl',
              'bg-[var(--bg-surface)] p-6',
              'shadow-[var(--shadow-lg)] border border-[var(--border)]',
            )}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-[var(--border)] mx-auto mb-5 sm:hidden" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-semibold mb-1">Compartir lista</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Envía este enlace a tu familia o amigos
            </p>

            {/* QR Code */}
            {qrSvg && (
              <div className="flex justify-center mb-4">
                <div
                  className="w-36 h-36 p-2 rounded-xl bg-white border border-[var(--border)]"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              </div>
            )}

            {/* Peers count */}
            <div className="flex items-center gap-2 mb-4 text-sm text-[var(--text-secondary)]">
              <Users size={16} />
              <span>
                {peers === 0
                  ? 'Solo tú por ahora'
                  : `${peers} conectado${peers !== 1 ? 's' : ''}`}
              </span>
            </div>

            {/* Quick share — Web Share API */}
            {navigator.share && (
              <Button
                variant="primary"
                size="md"
                onClick={quickShare}
                className="w-full mb-3"
              >
                <Share2 size={16} />
                Compartir
              </Button>
            )}

            {/* Link + copy */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <span className="flex-1 text-sm text-[var(--text-secondary)] truncate">
                {link}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyLink}
                aria-label={copied ? 'Copiado' : 'Copiar link'}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>

            {copied && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-[var(--accent)] mt-2 text-center"
              >
                ✓ Link copiado al portapapeles
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
