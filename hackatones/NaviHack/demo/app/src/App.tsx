import { useEffect, useState } from 'react'
import MapScreen from './components/MapScreen'
import FichaScreen from './components/FichaScreen'
import RutasScreen from './components/RutasScreen'

function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash || '#/')
  useEffect(() => {
    const onChange = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export default function App() {
  const route = useHashRoute()
  if (route.startsWith('#/ficha')) return <FichaScreen />
  if (route.startsWith('#/rutas')) return <RutasScreen />
  return <MapScreen />
}
