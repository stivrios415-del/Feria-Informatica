import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './Visitantes.css'

const initialForm = { nombre: '', correo: '', colegio: '' }

export default function Visitantes() {
  const [form, setForm] = useState(initialForm)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [enviando, setEnviando] = useState(false)

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setEnviando(true)
    setMsg({ text: '', type: '' })

    const { error } = await supabase.from('visitantes').insert({
      nombre: form.nombre.trim(),
      correo: form.correo.trim(),
      colegio: form.colegio.trim(),
    })

    setEnviando(false)

    if (error) {
      setMsg({ text: 'Ocurrió un error al registrarte: ' + error.message, type: 'err' })
    } else {
      setMsg({ text: '✅ ¡Registro realizado correctamente!', type: 'ok' })
      setForm(initialForm)
      setTimeout(() => setMsg({ text: '', type: '' }), 4000)
    }
  }

  return (
    <div className="visitantes-page">
      <div className="fondo fondo1"></div>
      <div className="fondo fondo2"></div>
      <div className="fondo fondo3"></div>

      <div className="particulas">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="contenedor">
        <div className="encabezado">
          <div className="logo" aria-label="Graduación">
            <svg className="icono-graduacion" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M8 25L32 12l24 13-24 13L8 25Z" fill="currentColor" />
              <path
                d="M17 31v10c0 2 7 8 15 8s15-6 15-8V31L32 39 17 31Z"
                fill="currentColor"
                opacity=".8"
              />
              <path d="M56 25v14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <circle cx="56" cy="42" r="3" fill="currentColor" />
            </svg>
          </div>

          <h1>¡Bienvenidos Estudiantes!</h1>
          <div className="linea"></div>
          <p className="subtitulo">
            Completa tu registro para formar parte de nuestra comunidad estudiantil.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grupo">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              type="text"
              id="nombre"
              placeholder="Escribe tu nombre completo"
              required
              value={form.nombre}
              onChange={(e) => updateField('nombre', e.target.value)}
            />
          </div>

          <div className="grupo">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              type="email"
              id="correo"
              placeholder="ejemplo@gmail.com"
              required
              value={form.correo}
              onChange={(e) => updateField('correo', e.target.value)}
            />
          </div>

          <div className="grupo">
            <label htmlFor="colegio">Colegio de procedencia</label>
            <input
              type="text"
              id="colegio"
              placeholder="Nombre de tu colegio"
              required
              value={form.colegio}
              onChange={(e) => updateField('colegio', e.target.value)}
            />
          </div>

          <button type="submit" className="boton" disabled={enviando}>
            {enviando ? 'Registrando...' : '✨ Registrar estudiante'}
          </button>
        </form>

        {msg.text && <div className={`mensaje ${msg.type}`}>{msg.text}</div>}

        <div className="pie">Registro de estudiantes • 2026</div>
      </div>
    </div>
  )
}