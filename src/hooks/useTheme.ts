import { useState, useEffect, useCallback } from 'react'
import type { ThemeMode } from '../types'

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('theme') as ThemeMode | null
    if (stored && stored !== 'auto') return stored
    if (stored === 'auto' || window.matchMedia('(prefers-color-scheme: dark)').matches) return 'auto'
    return 'light'
  })

  const [systemDark, setSystemDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const resolved = theme === 'auto' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark', 'high-contrast')
    root.classList.add(resolved)
    localStorage.setItem('theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      const colors = { light: '#fafafa', dark: '#111315', 'high-contrast': '#000000' }
      // ponytail: auto mode picks light/dark colors based on system preference
      meta.setAttribute('content', resolved === 'dark' ? colors.dark : colors.light)
    }
  }, [theme, resolved])

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t)
  }, [])

  const cycleTheme = useCallback(() => {
    setThemeState(prev => {
      if (prev === 'light') return 'auto'
      if (prev === 'auto') return 'dark'
      if (prev === 'dark') return 'high-contrast'
      return 'light'
    })
  }, [])

  return { theme, setTheme, cycleTheme, resolved }
}
