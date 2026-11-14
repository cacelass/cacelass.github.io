import { useState } from 'react'
import { Px } from '../icons'
import ThemeToggle from './ThemeToggle'
import TimeBar from './TimeBar'
import mapImg from '../assets/mapa-escritorio.jpg'

const LAYERS = [
  { id: 'navidad', icon: 'tree', label: 'Navidad' },
  { id: 'eventos', icon: 'calendar', label: 'Eventos' },
  { id: 'buses', icon: 'bus', label: 'Buses' },
  { id: 'trenes', icon: 'train', label: 'Trenes' },
] as const

export default function MapScreen() {
  const [on, setOn] = useState<Record<string, boolean>>({ navidad: true, eventos: true, buses: true, trenes: false })
  const [searchOpen, setSearchOpen] = useState(false)

  const toggle = (id: string) => setOn((s) => ({ ...s, [id]: !s[id] }))

  return (
    <div className="app">
      <div className="map">
        <img className="map__bg" src={mapImg} alt="Mapa isométrico de Vigo" />
        <div className="map__tint" />
        <div className="map__mks">
          <button className="mk" data-kind="bus" style={{ left: '68%', top: '60%' }} aria-label="Parada de bus"><Px name="bus" size={20} /></button>
          <button className="mk" data-kind="train" style={{ left: '14%', top: '20%' }} aria-label="Estación"><Px name="train" size={20} /></button>
          <a className="asset asset-noria" href="#/ficha" aria-label="Noria gigante"><Px name="wheel" size={72} /></a>
          <a className="asset asset-arbol" href="#/ficha" aria-label="Árbol gigante de Nadal"><Px name="tree" size={80} /></a>
        </div>
      </div>

      <div className="hud">
        <div className="hud__brand"><Px name="star" size={20} /><span className="wm">TinyVigo</span></div>
        <div className="hud__center">
          <div className={'search' + (searchOpen ? ' is-open' : ' is-collapsed')}>
            <button className="search__btn btn ic" aria-label="Buscar" onClick={() => setSearchOpen(true)}><Px name="search" size={20} /></button>
            <input
              placeholder="Buscar un sitio, una calle o una estación"
              aria-label="Buscar"
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
          </div>
          <div className="layers">
            {LAYERS.map((l) => (
              <button
                key={l.id}
                className={'chip chip--layer' + (on[l.id] ? ' on' : '')}
                aria-pressed={on[l.id]}
                onClick={() => toggle(l.id)}
              >
                <Px name={l.icon} size={20} />{l.label}
              </button>
            ))}
            <a className="chip chip--layer" href="#/rutas"><Px name="route" size={20} />Rutas</a>
          </div>
        </div>
        <div className="hud__right"><ThemeToggle /></div>
      </div>

      <div className="zoom">
        <button className="btn ic" aria-label="Acercar"><Px name="plus" size={16} /></button>
        <button className="btn ic" aria-label="Alejar"><Px name="minus" size={16} /></button>
      </div>

      <TimeBar style={{ position: 'absolute', left: 12, bottom: 12 }} withWeather />
    </div>
  )
}
