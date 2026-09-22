import { useCallback, useEffect, useState } from 'react'
import Topbar from '../components/Topbar'
import Tabs from '../components/Tabs'
import MsgBox from '../components/MsgBox'
import ExcelJS from 'exceljs'
import Badge from '../components/Badge'
import { supabase } from '../lib/supabaseClient'
import { calcularNotaFinal, CATEGORIAS } from '../lib/criterios'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh'

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin caracteres ambiguos (0/O, 1/I)

export default function Admin() {
  const { isAdmin, checking, error, login, logout } = useAdminAuth()

  if (checking) return null

  return (
    <>
      <Topbar>{isAdmin && <button onClick={logout}>Cerrar sesión</button>}</Topbar>
      <div className="wrap">
        {!isAdmin ? <LoginAdmin onLogin={login} error={error} /> : <PanelAdmin />}
      </div>
    </>
  )
}

function LoginAdmin({ onLogin, error }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onLogin(email, pass)
  }

  return (
    <div className="card">
      <h2>Acceso de administrador</h2>
      <form onSubmit={handleSubmit}>
        <label>Correo</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Contraseña</label>
        <input type="password" required value={pass} onChange={(e) => setPass(e.target.value)} />
        <button className="btn" type="submit">
          Ingresar
        </button>
        <MsgBox text={error} type="err" />
      </form>
    </div>
  )
}

function PanelAdmin() {
  const [tab, setTab] = useState('proyectos')
  const [calificacionAbierta, setCalificacionAbierta] = useState(true)
  const [proyectos, setProyectos] = useState([])
  const [jueces, setJueces] = useState([])
  const [calificaciones, setCalificaciones] = useState([])
  const [visitantes, setVisitantes] = useState([])

  const cargarEstado = useCallback(async () => {
    const { data } = await supabase
      .from('config')
      .select('calificacion_abierta')
      .eq('key', 'estado')
      .maybeSingle()
    setCalificacionAbierta(data ? data.calificacion_abierta !== false : true)
  }, [])

  const cargarTodo = useCallback(async () => {
    const [{ data: p }, { data: j }, { data: c }, { data: v }] = await Promise.all([
      supabase.from('proyectos').select('*').order('created_at', { ascending: false }),
      supabase.from('jueces').select('*'),
      supabase.from('calificaciones').select('*'),
      supabase.from('visitantes').select('*').order('created_at', { ascending: false }),
    ])
    setProyectos(p || [])
    setJueces(j || [])
    setCalificaciones(c || [])
    setVisitantes(v || [])
  }, [])

  useEffect(() => {
    cargarEstado()
    cargarTodo()
  }, [cargarEstado, cargarTodo])

  useRealtimeRefresh(
    'admin-realtime',
    ['proyectos', 'jueces', 'calificaciones', 'visitantes'],
    cargarTodo
  )

  async function toggleEstado() {
    const nuevo = !calificacionAbierta
    setCalificacionAbierta(nuevo)
    await supabase.from('config').update({ calificacion_abierta: nuevo }).eq('key', 'estado')
  }

  return (
    <>
      <div className="card">
        <h2>Control de calificación</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '.85rem' }}>
          Mientras esté abierta, los jueces pueden calificar y editar sus notas.
        </p>
        <button className={'btn ' + (calificacionAbierta ? 'danger' : '')} onClick={toggleEstado}>
          {calificacionAbierta
            ? '🔓 Calificación ABIERTA (clic para cerrar)'
            : '🔒 Calificación CERRADA (clic para abrir)'}
        </button>
      </div>

      <Tabs
        items={[
          { value: 'proyectos', label: 'Proyectos' },
          { value: 'jueces', label: 'Jueces' },
          { value: 'resultados', label: 'Resultados' },
          { value: 'visitantes', label: 'Visitantes' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'proyectos' && <TabProyectos proyectos={proyectos} onChange={cargarTodo} />}
      {tab === 'jueces' && <TabJueces jueces={jueces} onChange={cargarTodo} />}
      {tab === 'resultados' && (
        <TabResultados proyectos={proyectos} calificaciones={calificaciones} />
      )}
      {tab === 'visitantes' && <TabVisitantes visitantes={visitantes} />}
    </>
  )
}

function TablaProyectosCategoria({ categoria, proyectos, onChange }) {
  async function aprobar(id) {
    await supabase.from('proyectos').update({ estado: 'aprobado' }).eq('id', id)
    onChange()
  }
  async function rechazar(id) {
    await supabase.from('proyectos').update({ estado: 'rechazado' }).eq('id', id)
    onChange()
  }
  async function eliminar(id) {
    if (!confirm('¿Eliminar este proyecto?')) return
    await supabase.from('proyectos').delete().eq('id', id)
    onChange()
  }

  return (
    <div className="card">
      <h2>{categoria}</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Institución</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: 'var(--text-dim)' }}>
                  Todavía no hay proyectos inscritos en esta categoría.
                </td>
              </tr>
            )}
            {proyectos.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre_proyecto}</td>
                <td>{p.institucion || ''}</td>
                <td>
                  <Badge estado={p.estado} />
                </td>
                <td>
                  {p.estado !== 'aprobado' && (
                    <button
                      className="btn"
                      style={{ marginTop: 0, padding: '5px 10px', fontSize: '.75rem' }}
                      onClick={() => aprobar(p.id)}
                    >
                      Aprobar
                    </button>
                  )}
                  {p.estado !== 'rechazado' && (
                    <button
                      className="btn secondary"
                      style={{ marginTop: 0, padding: '5px 10px', fontSize: '.75rem', marginLeft: 6 }}
                      onClick={() => rechazar(p.id)}
                    >
                      Rechazar
                    </button>
                  )}
                  <button
                    className="btn danger"
                    style={{ marginTop: 0, padding: '5px 10px', fontSize: '.75rem', marginLeft: 6 }}
                    onClick={() => eliminar(p.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TabProyectos({ proyectos, onChange }) {
  return (
    <>
      {CATEGORIAS.map((categoria) => (
        <TablaProyectosCategoria
          key={categoria}
          categoria={categoria}
          proyectos={proyectos.filter((p) => p.categoria === categoria)}
          onChange={onChange}
        />
      ))}
    </>
  )
}

function TabJueces({ jueces, onChange }) {
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState({ text: '', type: '' })

  function generarCodigo() {
    const c = Array.from(
      { length: 6 },
      () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)]
    ).join('')
    setCodigo(c)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg({ text: '', type: '' })
    const { error } = await supabase.from('jueces').insert({
      nombre: nombre.trim(),
      codigo: codigo.trim().toUpperCase(),
      email: email.trim() || null,
    })
    if (error) {
      setMsg({ text: 'Error al registrar el juez: ' + error.message, type: 'err' })
    } else {
      setMsg({ text: `Juez registrado. Código: ${codigo} — compártelo con ${nombre}.`, type: 'ok' })
      setNombre('')
      setCodigo('')
      setEmail('')
      onChange()
    }
  }

  async function eliminarJuez(id) {
    if (!confirm('¿Eliminar este juez? Perderá acceso de inmediato.')) return
    await supabase.from('jueces').delete().eq('id', id)
    onChange()
  }

  return (
    <>
      <div className="card">
        <h2>Registrar juez</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '.85rem' }}>
          No necesita correo ni contraseña. Solo genera un código único y compártelo con el juez —
          lo ingresará en <b>juez.html</b> para entrar.
        </p>
        <form onSubmit={handleSubmit}>
          <label>Nombre del juez</label>
          <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <label>Código de acceso</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              required
              style={{ flex: 1, textTransform: 'uppercase', letterSpacing: 2 }}
              placeholder="Ej: ROBOT01"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
            <button
              type="button"
              className="btn secondary"
              style={{ marginTop: 0, whiteSpace: 'nowrap' }}
              onClick={generarCodigo}
            >
              Generar
            </button>
          </div>
          <label>Correo (opcional)</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn" type="submit">
            Registrar juez
          </button>
          <MsgBox text={msg.text} type={msg.type} />
        </form>
      </div>
      <div className="card">
        <h2>Jueces registrados</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Correo</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {jueces.map((j) => (
                <tr key={j.id}>
                  <td>{j.nombre}</td>
                  <td>
                    <b style={{ letterSpacing: 2, color: 'var(--gold)' }}>{j.codigo}</b>
                  </td>
                  <td>{j.email || ''}</td>
                  <td>
                    <Badge estado={j.auth_id ? 'aprobado' : 'pendiente'}>
                      {j.auth_id ? 'Ya ingresó' : 'Sin usar'}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="btn danger"
                      style={{ marginTop: 0, padding: '5px 10px', fontSize: '.75rem' }}
                      onClick={() => eliminarJuez(j.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function calcularFilasResultados(proyectos, calificaciones, categoria) {
  return proyectos
    .filter((p) => p.estado === 'aprobado' && p.categoria === categoria)
    .map((p) => {
      const califs = calificaciones.filter((c) => c.proyecto_id === p.id)
      const notas = califs.map((c) => calcularNotaFinal(c))
      const promedio = notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null
      return { nombre: p.nombre_proyecto, numJueces: califs.length, promedio }
    })
    .sort((a, b) => (b.promedio ?? -1) - (a.promedio ?? -1))
}

function llenarHojaResultados(sheet, filas) {
  sheet.columns = [
    { header: '#', key: 'pos', width: 6 },
    { header: 'Proyecto', key: 'nombre', width: 34 },
    { header: '# Jueces', key: 'numJueces', width: 12 },
    { header: 'Nota final', key: 'promedio', width: 14 },
  ]

  const header = sheet.getRow(1)
  header.height = 24
  header.eachCell((cell) => {
    cell.font = { bold: true, size: 12, color: { argb: 'FF04121C' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5C542' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = { bottom: { style: 'medium', color: { argb: 'FF04121C' } } }
  })

  const colorMedalla = ['FFFFF0B8', 'FFE7E7E7', 'FFF0D3B8']

  filas.forEach((f, i) => {
    const row = sheet.addRow({
      pos: i + 1,
      nombre: f.nombre,
      numJueces: f.numJueces,
      promedio: f.promedio !== null ? Number(f.promedio.toFixed(2)) : null,
    })
    row.height = 20
    row.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 2 ? 'left' : 'center' }
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } } }
      if (i < 3) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorMedalla[i] } }
        cell.font = { bold: true }
      }
    })
  })

  sheet.getColumn('promedio').numFmt = '0.00'
  sheet.autoFilter = { from: 'A1', to: 'D1' }
}

function TabResultados({ proyectos, calificaciones }) {
  async function exportarExcel() {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Feria de Informática Gaming Edition'
    workbook.created = new Date()

    CATEGORIAS.forEach((categoria) => {
      const filas = calcularFilasResultados(proyectos, calificaciones, categoria)
      const sheet = workbook.addWorksheet(categoria.slice(0, 31), {
        views: [{ state: 'frozen', ySplit: 1 }],
      })
      llenarHojaResultados(sheet, filas)
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resultados_feria_informatica.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="card">
        <h2>Resultados</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '.85rem' }}>
          Un ranking por cada categoría. El Excel exporta ambas en hojas separadas.
        </p>
        <button className="btn gold" onClick={exportarExcel}>
          Exportar Excel
        </button>
      </div>

      {CATEGORIAS.map((categoria) => {
        const filas = calcularFilasResultados(proyectos, calificaciones, categoria)
        return (
          <div className="card" key={categoria}>
            <h2>{categoria}</h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Proyecto</th>
                    <th># Jueces</th>
                    <th>Nota final</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ color: 'var(--text-dim)' }}>
                        Todavía no hay proyectos aprobados con calificación en esta categoría.
                      </td>
                    </tr>
                  )}
                  {filas.map((f, i) => (
                    <tr key={f.nombre + i}>
                      <td>{i + 1}</td>
                      <td>{f.nombre}</td>
                      <td>{f.numJueces}</td>
                      <td>{f.promedio !== null ? f.promedio.toFixed(2) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </>
  )
}

function TabVisitantes({ visitantes }) {
  async function exportarExcel() {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Feria de Informática Gaming Edition'
    workbook.created = new Date()

    const sheet = workbook.addWorksheet('Visitantes', {
      views: [{ state: 'frozen', ySplit: 1 }],
    })

    sheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 28 },
      { header: 'Correo', key: 'correo', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 16 },
      { header: 'Colegio', key: 'colegio', width: 28 },
      { header: 'Fecha de registro', key: 'fecha', width: 20 },
    ]

    const header = sheet.getRow(1)
    header.height = 24
    header.eachCell((cell) => {
      cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A8FB0' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border = { bottom: { style: 'medium', color: { argb: 'FF04121C' } } }
    })

    visitantes.forEach((v, i) => {
      const row = sheet.addRow({
        nombre: v.nombre,
        correo: v.correo,
        telefono: v.telefono || '',
        colegio: v.colegio,
        fecha: new Date(v.created_at).toLocaleString('es-HN'),
      })
      row.height = 20
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle' }
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } } }
        if (i % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F7F7' } }
        }
      })
    })

    sheet.autoFilter = { from: 'A1', to: 'E1' }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'visitantes_feria_informatica.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card">
      <h2>Visitantes registrados ({visitantes.length})</h2>
      <p style={{ color: 'var(--text-dim)', fontSize: '.85rem' }}>
        Estudiantes que se registraron en <code>/registro-visitantes</code>. Úsalo para enviar
        promociones o como base para la ruleta de premios.
      </p>
      <button className="btn gold" onClick={exportarExcel}>
        Exportar Excel
      </button>
      <div className="table-scroll">
        <table style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Colegio</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {visitantes.map((v) => (
              <tr key={v.id}>
                <td>{v.nombre}</td>
                <td>{v.correo}</td>
                <td>{v.telefono || ''}</td>
                <td>{v.colegio}</td>
                <td>{new Date(v.created_at).toLocaleString('es-HN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
