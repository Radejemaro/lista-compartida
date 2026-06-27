import { Sun, Moon, Eye } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { Button } from './ui/Button'

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme()

  const icons = {
    light: <Sun size={18} />,
    dark: <Moon size={18} />,
    'high-contrast': <Eye size={18} />,
  }

  const labels = {
    light: 'Modo claro',
    dark: 'Modo oscuro',
    'high-contrast': 'Alto contraste',
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      aria-label={labels[theme]}
      title={labels[theme]}
    >
      {icons[theme]}
    </Button>
  )
}
