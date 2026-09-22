import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Maneja el acceso de jueces por código (sin correo/contraseña):
 * crea una sesión anónima si no existe y reclama el código vía RPC.
 * Si el navegador ya tenía sesión (código ingresado antes), entra directo.
 */
export function useJuezAuth() {
  const [juez, setJuez] = useState(null) // { id, nombre }
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        setChecking(false)
        return
      }
      const { data } = await supabase.rpc('mi_juez')
      if (data && data.length) {
        setJuez({ id: data[0].id, nombre: data[0].nombre })
      }
      setChecking(false)
    })()
  }, [])

  async function login(codigo) {
    setError('')
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        const { error: anonErr } = await supabase.auth.signInAnonymously()
        if (anonErr) throw anonErr
      }

      const { data, error: rpcErr } = await supabase.rpc('vincular_juez', {
        p_codigo: codigo.trim().toUpperCase(),
      })
      if (rpcErr) throw rpcErr
      if (!data || !data.length) throw new Error('Código inválido')

      setJuez({ id: data[0].id, nombre: data[0].nombre })
    } catch (err) {
      setError('No se pudo ingresar: ' + (err.message || err))
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    setJuez(null)
  }

  return { juez, checking, error, login, logout }
}
