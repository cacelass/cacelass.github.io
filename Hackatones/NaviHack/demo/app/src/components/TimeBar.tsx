import { useRef, useState, type CSSProperties } from 'react'
import { Px } from '../icons'

const hh = (m: number) => {
  m = ((m % 1440) + 1440) % 1440
  return String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
}

export default function TimeBar({
  style,
  note,
  withWeather,
}: {
  style?: CSSProperties
  note?: string
  withWeather?: boolean
}) {
  const [p, setP] = useState(0.9)
  const [time, setTime] = useState('21:30')
  const trackRef = useRef<HTMLDivElement>(null)

  const set = (value: number) => {
    const next = Math.max(0, Math.min(1, value))
    setP(next)
    setTime(hh(Math.round(next * 1439)))
  }

  const fromEvent = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect()
    if (!r) return
    set((clientX - r.left) / r.width)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      set(p + (e.key === 'ArrowRight' ? 0.02 : -0.02))
    }
  }

  return (
    <div className="timebar" style={{ ...style, ['--p' as string]: p }}>
      <button className="btn ic timebar__toggle" aria-label="Cambiar entre día y noche"><Px name="moon" size={20} /></button>
      <span className="timebar__time">{time}</span>
      <div
        className="timebar__track"
        role="slider"
        aria-label="Hora"
        aria-valuemin={0}
        aria-valuemax={1439}
        aria-valuenow={Math.round(p * 1439)}
        tabIndex={0}
        ref={trackRef}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          fromEvent(e.clientX)
        }}
        onPointerMove={(e) => { if (e.buttons === 1) fromEvent(e.clientX) }}
      >
        <span className="timebar__fill" />
        <span className="timebar__thumb" />
      </div>
      {withWeather ? (
        <span className="timebar__weather"><Px name="rain" size={20} /><span className="timebar__temp">8°</span></span>
      ) : note ? (
        <span className="timebar__note">{note}</span>
      ) : null}
    </div>
  )
}
