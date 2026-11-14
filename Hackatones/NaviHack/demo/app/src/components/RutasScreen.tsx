import { Px, type IconName } from '../icons'
import ThemeToggle from './ThemeToggle'
import TimeBar from './TimeBar'
import mapImg from '../assets/mapa-escritorio.jpg'

const OPCIONES = [
  { title: 'La más rápida', why: 'Todo lo elegido en el menor tiempo total.', tiempo: '1 h 25', km: '3,4 km', paradas: '5', rec: true },
  { title: 'Después del anochecer', why: 'Las luces se visitan encendidas; lo que solo abre de día va primero.', tiempo: '1 h 40', km: '3,8 km', paradas: '4', rec: false },
  { title: 'Paseo suave', why: 'Evita las cuestas y los tramos largos sin donde sentarse.', tiempo: '1 h 55', km: '3,6 km', paradas: '4', rec: false },
]

type Step =
  | { kind: 'stop'; t: string; n: number; h: string; fixed?: string }
  | { kind: 'leg'; icon: IconName; text: string }

const TIMELINE: Step[] = [
  { kind: 'stop', t: '19:00', n: 1, h: 'Salida · mi ubicación' },
  { kind: 'leg', icon: 'walk', text: '11 min · 800 m' },
  { kind: 'stop', t: '19:11', n: 2, h: 'Noria gigante' },
  { kind: 'leg', icon: 'walk', text: '9 min · 600 m' },
  { kind: 'stop', t: '19:30', n: 3, h: 'Desfile de los Reyes', fixed: 'hora fija' },
  { kind: 'leg', icon: 'walk', text: '4 min · 300 m' },
  { kind: 'stop', t: '20:00', n: 4, h: 'Árbol gigante de Nadal' },
  { kind: 'leg', icon: 'bus', text: 'Bus 4C, 12 min · horario' },
  { kind: 'stop', t: '20:45', n: 5, h: 'Alameda' },
]

const STOPS = [
  { left: '13%', top: '83%' },
  { left: '30%', top: '62%' },
  { left: '42%', top: '50%' },
  { left: '57%', top: '46%' },
  { left: '72%', top: '33%' },
  { left: '87%', top: '25%' },
]

export default function RutasScreen() {
  return (
    <div className="page page-ruta">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Rutas a pie</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <a className="btn sec ic" href="#/" aria-label="Volver al mapa"><Px name="x" size={16} /></a>
          <ThemeToggle />
        </div>
      </div>

      <div className="input"><Px name="pin" size={16} mono />Desde <b>mi ubicación</b> · <b>esta noche, 19:00–22:30</b></div>

      <div className="chips">
        <button className="chip on" aria-pressed="true"><Px name="walk" size={16} />A pie</button>
        <button className="chip" aria-pressed="false"><Px name="bus" size={16} />A pie + bus</button>
        <span style={{ alignSelf: 'center', color: 'var(--mute)', fontSize: 13 }}>4 paradas · 2 eventos</span>
      </div>

      <div className="opciones">
        {OPCIONES.map((o, i) => (
          <div className={'opc' + (i === 0 ? ' sel' : '')} key={o.title}>
            {o.rec && <span className="rec">Recomendada</span>}
            <h3>{o.title}</h3>
            <p className="why">{o.why}</p>
            <div className="opc__nums">
              <div><span className="num">{o.tiempo}</span><span className="lbl">tiempo</span></div>
              <div><span className="num">{o.km}</span><span className="lbl">a pie</span></div>
              <div><span className="num">{o.paradas}</span><span className="lbl">paradas</span></div>
            </div>
            <button className={'btn go' + (i === 0 ? ' pri' : ' sec')}><Px name="route" size={16} />Elegir esta</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <span className="toast toast--warn"><Px name="rain" size={16} />Lloverá a las 21:00 en esta ruta <button className="btn sec">Favorecer paradas cubiertas</button></span>
        <span className="toast toast--info"><Px name="ticket" size={16} />El mercadillo no se alcanza a tiempo · <button className="btn sec">Quitarlo</button></span>
      </div>

      <h2 style={{ font: '500 14px/1.4 var(--f-ui)', color: 'var(--ink2)', margin: '8px 0 0' }}>La más rápida, en el mapa</h2>
      <div className="routemap" style={{ backgroundImage: `url('${mapImg}')` }}>
        <svg viewBox="0 0 600 240" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="80,200 180,150 250,120 340,110 430,80 520,60" fill="none" stroke="var(--hi)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" shapeRendering="crispEdges" />
        </svg>
        {STOPS.map((s, i) => (
          <span className="stn" style={s} key={i}>{i + 1}</span>
        ))}
      </div>

      <ol className="timeline">
        {TIMELINE.map((step, i) => step.kind === 'leg' ? (
          <li key={i}>
            <span className="t" />
            <span />
            <div className="leg"><Px name={step.icon} size={14} mono />{step.text}</div>
          </li>
        ) : (
          <li key={i} className={step.fixed ? 'is-fixed' : undefined}>
            <span className="t">{step.t}</span>
            <span className="n">{step.n}</span>
            <h4>{step.h}{step.fixed && <span className="fixed"> {step.fixed}</span>}</h4>
          </li>
        ))}
      </ol>

      <TimeBar style={{ alignSelf: 'flex-start' }} note="ver la ruta a otra hora" />

      <p style={{ margin: 0, color: 'var(--mute)', fontSize: 12 }}>El estado (ruta, hora y capas) va en la URL para poder compartirlo.</p>
    </div>
  )
}
