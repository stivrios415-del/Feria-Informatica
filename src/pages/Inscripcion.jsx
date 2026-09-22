import { useState } from 'react'
import Topbar from '../components/Topbar'
import MsgBox from '../components/MsgBox'
import { supabase } from '../lib/supabaseClient'
import { CATEGORIAS, CRITERIOS } from '../lib/criterios'
import './Inscripcion.css'

const initialForm = {
  nombreProyecto: '',
  categoria: '',
  institucion: '',
  integrantes: '',
  descripcion: '',
  correo: '',
}

const DESCRIPCION_MAX = 280

export default function Inscripcion() {
  const [form, setForm] = useState(initialForm)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [enviando, setEnviando] = useState(false)

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg({ text: '', type: '' })
    setEnviando(true)

    const data = {
      nombre_proyecto: form.nombreProyecto.trim(),
      categoria: form.categoria,
      institucion: form.institucion.trim(),
      integrantes: form.integrantes.trim(),
      descripcion: form.descripcion.trim(),
      correo: form.correo.trim(),
      estado: 'pendiente',
    }

    const { error } = await supabase.from('proyectos').insert(data)
    setEnviando(false)

    if (error) {
      setMsg({ text: 'Ocurrió un error al enviar la inscripción: ' + error.message, type: 'err' })
    } else {
      setMsg({
        text: '¡Proyecto inscrito con éxito! Quedará visible para los jueces en cuanto el administrador lo apruebe.',
        type: 'ok',
      })
      setForm(initialForm)
    }
  }

  const descCount = form.descripcion.length
  const descNear = descCount > DESCRIPCION_MAX - 40

  return (
    <div className="inscripcion-page">
      <Topbar />
      <div className="i-wrap">
        <div>
          <div className="i-head">
            <span className="i-eyebrow">Inscripción de proyecto</span>
            <h1>Registra tu equipo</h1>
            <p>
              Completa los datos de tu proyecto para participar en Desarrollo de Software o
              Robótica. Un administrador lo aprobará antes de que quede visible para los jueces.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="i-section">
              <h2>Proyecto</h2>
              <label>Nombre del proyecto</label>
              <input
                type="text"
                required
                value={form.nombreProyecto}
                onChange={(e) => updateField('nombreProyecto', e.target.value)}
              />

              <label>Categoría</label>
              <div className="i-cats">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={'i-cat' + (form.categoria === cat ? ' active' : '')}
                    onClick={() => updateField('categoria', cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="i-counter-row">
                <label>Descripción breve del proyecto</label>
                <span className={'i-counter' + (descNear ? ' i-counter-near' : '')}>
                  {descCount}/{DESCRIPCION_MAX}
                </span>
              </div>
              <textarea
                id="descripcion"
                required
                maxLength={DESCRIPCION_MAX}
                placeholder="¿Qué hace tu proyecto?"
                value={form.descripcion}
                onChange={(e) => updateField('descripcion', e.target.value)}
              />
            </div>

            <div className="i-section">
              <h2>Equipo</h2>
              <label>Institución / Colegio / Universidad</label>
              <input
                type="text"
                required
                value={form.institucion}
                onChange={(e) => updateField('institucion', e.target.value)}
              />
              <label>Integrantes del equipo (uno por línea)</label>
              <textarea
                required
                placeholder={'Nombre 1\nNombre 2\nNombre 3'}
                value={form.integrantes}
                onChange={(e) => updateField('integrantes', e.target.value)}
              />
            </div>

            <div className="i-section">
              <h2>Contacto</h2>
              <label>Correo de contacto</label>
              <input
                type="email"
                required
                value={form.correo}
                onChange={(e) => updateField('correo', e.target.value)}
              />

              <button className="btn i-submit" type="submit" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar inscripción'}
              </button>
              <MsgBox text={msg.text} type={msg.type} />
            </div>
          </form>
        </div>

        <aside className="i-side">
          <h3>Criterios de evaluación</h3>
          {CRITERIOS.map((c) => (
            <div className="i-crit" key={c.key}>
              <div className="i-crit-label">
                <span>{c.label}</span>
                <span>{Math.round(c.peso * 100)}%</span>
              </div>
              <div className="i-crit-bar">
                <span style={{ width: `${c.peso * 100}%` }} />
              </div>
            </div>
          ))}
          <p className="i-note">
            Estos son los criterios que usarán los jueces para calificar tu proyecto una vez
            aprobado. La nota final es el promedio ponderado de estos cinco puntos.
          </p>
        </aside>
      </div>
    </div>
  )
}