import { Px } from '../icons'
import ThemeToggle from './ThemeToggle'
import mapImg from '../assets/mapa-escritorio.jpg'
import fotoNoria from '../assets/foto-noria.jpg'

export default function FichaScreen() {
  return (
    <div className="app">
      <div className="map">
        <img className="map__bg" src={mapImg} alt="Mapa isométrico de Vigo" />
        <div className="map__tint" />
      </div>

      <div className="hud">
        <div className="hud__brand"><Px name="star" size={20} /><span className="wm">TinyVigo</span></div>
        <div className="hud__right"><ThemeToggle /></div>
      </div>

      <div className="sheet">
        <div className="panel" aria-label="Ficha del punto">
          <div className="panel__head">
            <div className="panel__photo" style={{ backgroundImage: `url('${fotoNoria}')` }} role="img" aria-label="Foto de la noria" />
            <div className="panel__sprite"><Px name="wheel" size={112} /></div>
            <div className="panel__title"><h2>Noria gigante</h2><p className="panel__type">Atracciones · Vialia</p></div>
            <a className="btn ic panel__close" href="#/" aria-label="Cerrar"><Px name="x" size={16} /></a>
          </div>

          <div className="panel__status" data-open="1">
            <Px name="open" size={16} />
            <span>Abierto ahora, hasta las <span className="big">22:30</span></span>
          </div>

          <p className="panel__hours">
            Laborables de 17:00 a 22:30
            <small>Cambia del 21 de diciembre al 12 de enero</small>
            <small>11 min andando</small>
          </p>

          <div className="panel__actions">
            <a className="btn sec" href="#/rutas"><Px name="walk" size={16} />Cómo llegar</a>
            <button className="btn pri"><Px name="route" size={16} />Añadir a la ruta</button>
          </div>

          <details className="panel__story" open>
            <summary>Historia</summary>
            <p>La noria cambia de sitio en 2026 y pasa a Vialia. La información viene de la prensa local y el Concello aún no la ha confirmado.</p>
            <a href="#/">Prensa local, sin confirmar por el Concello</a>
          </details>

          <div className="panel__near">
            <h3>Cerca de aquí hoy</h3>
            <div className="ev ev--compact"><span className="ev__time">19:30</span><div className="ev__body"><h4>Desfile de los Reyes Magos</h4><p>Rúa do Príncipe, 3 min</p></div></div>
            <div className="ev ev--compact"><span className="ev__time">20:00</span><div className="ev__body"><h4>Pase de música y luz</h4><p>En este punto</p></div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
