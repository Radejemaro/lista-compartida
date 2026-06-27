import { useState, useRef, useCallback } from 'react'

interface UseVoiceOptions {
  onItemAdd: (name: string) => boolean
  onQueryMissing: () => void
}

interface UseVoiceReturn {
  isListening: boolean
  isSupported: boolean
  permissionDenied: boolean
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
}

const SpeechRecognitionCtor =
  (window as unknown as Record<string, unknown>).SpeechRecognition ??
  (window as unknown as Record<string, unknown>).webkitSpeechRecognition

export function parseVoiceText(text: string, onItemAdd: (name: string) => boolean, onQueryMissing: () => void): void {
  const normalized = text.toLowerCase().trim()
  if (!normalized || normalized.length < 1) return

  const queryMatch = normalized.match(/(qué|que)\s+(falta|necesito|necesita|comprar|hace falta)/i)
  if (queryMatch) {
    onQueryMissing()
    return
  }

  const addMatch = normalized.match(/^(agrega|añade|pon|compra|necesito|quiero|falta)\s+(.+)/i)
  if (addMatch) {
    const raw = addMatch[2]
    // ponytail: parse "con nota" from the raw text; strips the note portion
    // and only adds the item name. Wire through note when updateItemNote lands.
    const items = raw
      .split(/\s*[,;]\s*|\s+y\s+(?:además\s+)?|\s+y\s*/)
      .map(s => s.trim().replace(/^y\s+/i, '').trim())
      .filter(s => s.length > 0)
      .map(s => s.replace(/\s+con\s+nota\s+.*/i, '').trim())
    items.forEach(i => onItemAdd(i))
    return
  }

  if (normalized.length > 1 && !normalized.includes(' ')) {
    onItemAdd(normalized)
    return
  }

  const tokens = normalized
    .split(/\s*[,;]\s*|\s+y\s+(?:además\s+)?|\s+y\s*/)
    .map(s => s.trim().replace(/^y\s+/i, '').trim())
    .filter(s => s.length > 1)
  if (tokens.length > 1) {
    tokens.forEach(i => onItemAdd(i))
  }
}

export function useVoice({ onItemAdd, onQueryMissing }: UseVoiceOptions): UseVoiceReturn {
  const [isListening, setListening] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(() =>
    sessionStorage.getItem('voicePermissionDenied') === 'true'
  )
  const recognition = useRef<{
    start: () => void
    abort: () => void
    lang: string
    continuous: boolean
    interimResults: boolean
    maxAlternatives: number
    onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null
    onerror: ((event: { error: string }) => void) | null
    onend: (() => void) | null
  } | null>(null)
  const stopped = useRef(false)

  const isSupported = !!SpeechRecognitionCtor

  const stopListening = useCallback(() => {
    stopped.current = true
    recognition.current?.abort()
    recognition.current = null
    setListening(false)
  }, [])

  const startListening = useCallback(() => {
    if (!SpeechRecognitionCtor || permissionDenied) return
    stopListening()

    stopped.current = false
    const Rec = SpeechRecognitionCtor as unknown as new () => {
      start: () => void
      abort: () => void
      lang: string
      continuous: boolean
      interimResults: boolean
      maxAlternatives: number
      onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null
      onerror: ((event: { error: string }) => void) | null
      onend: (() => void) | null
    }
    const rec = new Rec()
    rec.lang = 'es-MX'
    rec.continuous = true
    rec.interimResults = false
    rec.maxAlternatives = 3

    let transcriptAccumulator = ''

    rec.onresult = (event: { results: SpeechRecognitionResultList }) => {
      for (let i = event.results.length - 1; i >= 0; i--) {
        const result = event.results[i]
        if (result.isFinal) {
          const text = Array.from(result)
            .map(r => r.transcript.toLowerCase().trim())
            .filter(Boolean)
            .join(' ')
          if (text) {
            transcriptAccumulator += (transcriptAccumulator ? ' ' : '') + text
          }
        }
      }
    }

    rec.onerror = (event: { error: string }) => {
      if (event.error === 'not-allowed') {
        setPermissionDenied(true)
        sessionStorage.setItem('voicePermissionDenied', 'true')
      }
      setListening(false)
      recognition.current = null
    }

    rec.onend = () => {
      if (transcriptAccumulator && stopped.current) {
        parseVoiceText(transcriptAccumulator, onItemAdd, onQueryMissing)
        transcriptAccumulator = ''
      }
      if (!stopped.current) {
        rec.start()
      } else {
        setListening(false)
        recognition.current = null
      }
    }

    rec.start()
    recognition.current = rec
    setListening(true)
  }, [onItemAdd, onQueryMissing, permissionDenied, stopListening])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  return { isListening, isSupported, permissionDenied, startListening, stopListening, toggleListening }
}
