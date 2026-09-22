import { useCallback, useEffect, useMemo, useState } from 'react'
import Topbar from '../components/Topbar'
import Tabs from '../components/Tabs'
import { supabase } from '../lib/supabaseClient'
import { CATEGORIAS, calcularNotaFinal } from '../lib/criterios'
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh'
import './Ranking.css'

export default function Ranking() {
  const [categoriaActiva, setCategoriaActiva] = useState(CATEGORIAS[0])
  const [proyectos, setProyectos] = useState([])
  const [calificaciones, setCalificaciones] = useState([])

  const cargarDatos = useCallback(async () => {
    const { data: p } = await supabase.from('proyectos').select('*')
    setProyectos(p || [])
    const { data: c } = await supabase.from('calificaciones').select('*')
    setCalificaciones(c || [])
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  useRealtimeRefresh('ranking-realtime', ['proyectos', 'calificaciones'], cargarDatos)

  const filas = useMemo(() => {
    return proyectos
      .filter((p) => p.categoria === categoriaActiva && p.estado === 'aprobado')
      .map((p) => {
        const califs = calificaciones.filter((c) => c.proyecto_id === p.id)
        const notas = califs.map((c) => calcularNotaFinal(c))
        const promedio = notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null
        return { ...p, promedio, numJueces: califs.length }
      })
      .filter((f) => f.promedio !== null)
      .sort((a, b) => (b.promedio ?? -1) - (a.promedio ?? -1))
  }, [proyectos, calificaciones, categoriaActiva])

  return (
    <div className="ranking-page">
      <Topbar />
      <div className="wrap">
        <div className="r-head">
          <h1>Ranking</h1>
          <span className="r-live">
            <span className="dot" /> EN VIVO
          </span>
        </div>

        <Tabs
          items={CATEGORIAS.map((c) => ({ value: c, label: c }))}
          active={categoriaActiva}
          onChange={setCategoriaActiva}
        />
        <div>
          {filas.length === 0 && (
            <p className="footer-note">Todavía no hay proyectos calificados en esta categoría.</p>
          )}
          {filas.map((p, i) => (
            <div key={p.id} className={'rank-item' + (i === 0 ? ' top1' : '')}>
              <div className="pos">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </div>
              <div className="info">
                <div className="nom">{p.nombre_proyecto}</div>
                <div className="sub">{p.institucion || ''}</div>
              </div>
              <div className="score">
                {p.promedio.toFixed(2)}
                <small>{p.numJueces} juez(es)</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}