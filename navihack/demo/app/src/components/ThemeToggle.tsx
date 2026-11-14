import { useState } from 'react'
import { Px } from '../icons'

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light')

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('tinyvigo-theme', next) } catch { /* almacenamiento no disponible */ }
    setTheme(next)
  }

  const dark = theme === 'dark'
  return (
    <button
      className="btn ic"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      <Px name={dark ? 'moon' : 'sun'} size={20} />
    </button>
  )
}
