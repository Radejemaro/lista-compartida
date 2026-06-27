import { useState, useCallback, useRef } from 'react'

interface UseSpeakReturn {
  speak: (text: string) => void
  speaking: boolean
  cancel: () => void
}

export function useSpeak(): UseSpeakReturn {
  const [speaking, setSpeaking] = useState(false)
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'es-MX'
    u.rate = 1.1
    u.onstart = () => setSpeaking(true)
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    utterance.current = u
    window.speechSynthesis.speak(u)
  }, [])

  return { speak, speaking, cancel }
}
