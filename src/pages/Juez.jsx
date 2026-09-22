import { useCallback, useEffect, useState } from 'react'
import Topbar from '../components/Topbar'
import Tabs from '../components/Tabs'
import MsgBox from '../components/MsgBox'
import Badge from '../components/Badge'
import CriterioSlider from '../components/CriterioSlider'
import { supabase } from '../lib/supabaseClient'
import { CATEGORIAS, CRITERIOS, ESCALA_MIN, ESCALA_MAX, calcularNotaFinal } from '../lib/criterios'
import { useJuezAuth } from '../hooks/useJuezAuth'

export default function Juez() {
  const { juez, checking, error, login, logout } = useJuezAuth()

  if (checking) return null

  return (
    <>
      <Topbar>
        {juez && (
          <button onClick={logout}>Cerrar sesión</button>
        )}
      </Topbar>
      <div className="wrap">
        {!juez ? <LoginJuez onLogin={login} error={error} /> : <PanelJuez juez={juez} />}
      </div>
    </>
  )
}

function LoginJuez({ onLogin, error }) {
  const [codigo, setCodigo] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onLogin(codigo)
  }

  return (
    <div className="card">
      <h2>Acceso de jueces</h2>
      <p style={{ color: 'var(--text-dim)', fontSize: '.85rem' }}>
        Ingresa el código de acceso que te proporcionó el organizador de la feria.
      </p>
      <form onSubmit={handleSubmit}>
        <label>Código de acceso</label>
        <input
          type="text"
          required
          autoComplete="off"
          style={{
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontSize: '1.3rem',
            textAlign: 'center',
          }}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <button className="btn" type="submit">
          Ingresar
        </button>
        <MsgBox text={error} type="err" />
      </form>
    </div>
  )
}

function PanelJuez({ juez }) {
  const [categoriaActiva, setCategoriaActiva] = useState(CATEGORIAS[0])
  const [calificacionAbierta, setCalificacionAbierta] = useState(true)
  const [proyectos, setProyectos] = useState([])
  const [misCalificaciones, setMisCalificaciones] = useState({}) // proyecto_id -> calificacion

  const cargarConfig = useCallback(async () => {
    const { data } = await supabase
      .from('config')
      .select('calificacion_abierta')
      .eq('key', 'estado')
      .maybeSingle()
    setCalificacionAbierta(data ? data.calificacion_abierta !== false : true)
  }, [])

  const cargarProyectos = useCallback(async () => {
    const { data } = await supabase.from('proyectos').select('*').eq('estado', 'aprobado')
    setProyectos(data || [])
  }, [])

  const cargarMisCalificaciones = useCallback(async () => {
    const { data } = await supabase.from('calificaciones').select('*').eq('juez_id', juez.id)
    const mapa = {}
    ;(data || []).forEach((c) => {
      mapa[c.proyecto_id] = c
    })
    setMisCalificaciones(mapa)
  }, [juez.id])

  useEffect(() => {
    cargarConfig()
    cargarProyectos()
    cargarMisCalificaciones()
  }, [cargarConfig, cargarProyectos, cargarMisCalificaciones])

  const proyectosFiltrados = proyectos.filter((p) => p.categoria === categoriaActiva)

  async function guardarCalificacion(proyecto, valores) {
    const calif = {
      proyecto_id: proyecto.id,
      juez_id: juez.id,
      categoria: proyecto.categoria,
      updated_at: new Date().toISOString(),
      ...valores,
    }
    const { error } = await supabase
      .from('calificaciones')
      .upsert(calif, { onConflict: 'proyecto_id,juez_id' })

    if (!error) {
      setMisCalificaciones((prev) => ({ ...prev, [proyecto.id]: calif }))
    }
    return error
  }

  return (
    <>
      <p style={{ color: 'var(--text-dim)', fontSize: '.85rem' }}>
        Conectado como <b style={{ color: 'var(--blue)' }}>{juez.nombre}</b>
      </p>
      {!calificacionAbierta && (
        <div className="locked-banner">
          ⚠️ La calificación está cerrada por el administrador. No se pueden enviar ni editar
          notas.
        </div>
      )}
      <Tabs
        items={CATEGORIAS.map((c) => ({ value: c, label: c }))}
        active={categoriaActiva}
        onChange={setCategoriaActiva}
      />
      <div>
        {proyectosFiltrados.length === 0 && (
          <p className="footer-note">No hay proyectos aprobados en esta categoría todavía.</p>
        )}
        {proyectosFiltrados.map((p) => (
          <ProyectoCalificable
            key={p.id}
            proyecto={p}
            existente={misCalificaciones[p.id]}
            calificacionAbierta={calificacionAbierta}
            onGuardar={guardarCalificacion}
          />
        ))}
      </div>
    </>
  )
}

function ProyectoCalificable({ proyecto, existente, calificacionAbierta, onGuardar }) {
  const valorInicial = () => {
    const v = {}
    CRITERIOS.forEach((c) => {
      v[c.key] = existente ? existente[c.key] : Math.round((ESCALA_MIN + ESCALA_MAX) / 2)
    })
    return v
  }

  const [valores, setValores] = useState(valorInicial)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [guardando, setGuardando] = useState(false)

  const total = calcularNotaFinal(valores)

  async function handleGuardar() {
    setGuardando(true)
    setMsg({ text: '', type: '' })
    const error = await onGuardar(proyecto, valores)
    setGuardando(false)
    if (error) {
      setMsg({ text: 'Error al guardar: ' + error.message, type: 'err' })
    } else {
      setMsg({ text: 'Calificación guardada ✔', type: 'ok' })
    }
  }

  return (
    <div className="card">
      <h2>
        {proyecto.nombre_proyecto}{' '}
        {existente && <Badge estado="aprobado">Calificado</Badge>}
      </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '.85rem' }}>
        {proyecto.institucion || ''} — {proyecto.integrantes || ''}
      </p>
      <p
        style={{
          fontSize: '.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '.06em',
          color: 'var(--gold)',
          marginTop: 12,
        }}
      >
        Descripción del proyecto
      </p>
      <p style={{ fontSize: '.9rem', lineHeight: 1.5 }}>{proyecto.descripcion}</p>

      {CRITERIOS.map((c) => (
        <CriterioSlider
          key={c.key}
          criterio={c}
          value={valores[c.key]}
          disabled={!calificacionAbierta}
          onChange={(v) => setValores((prev) => ({ ...prev, [c.key]: v }))}
        />
      ))}

      <p style={{ marginTop: 10 }}>
        Nota final: <b style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>{total.toFixed(2)}</b>{' '}
        / 10
      </p>
      <button className="btn" disabled={!calificacionAbierta || guardando} onClick={handleGuardar}>
        {existente ? 'Actualizar calificación' : 'Guardar calificación'}
      </button>
      <MsgBox text={msg.text} type={msg.type} />
    </div>
  )
}
