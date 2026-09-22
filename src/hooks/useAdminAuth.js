import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Maneja la sesión de Supabase Auth para el panel de administrador y
 * verifica que el usuario logueado exista en la tabla "admins".
 */
export function useAdminAuth() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setChecking(true)
      const sessionUser = session?.user ?? null

      if (!sessionUser) {
        setUser(null)
        setIsAdmin(false)
        setChecking(false)
        return
      }

      const { data: adminRow } = await supabase
        .from('admins')
        .select('id')
        .eq('id', sessionUser.id)
        .maybeSingle()

      if (!adminRow) {
        setError('Esta cuenta no tiene permisos de administrador.')
        await supabase.auth.signOut()
        setUser(null)
        setIsAdmin(false)
        setChecking(false)
        return
      }

      setUser(sessionUser)
      setIsAdmin(true)
      setChecking(false)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  async function login(email, password) {
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('No se pudo iniciar sesión: ' + signInError.message)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return { user, isAdmin, checking, error, login, logout }
}
