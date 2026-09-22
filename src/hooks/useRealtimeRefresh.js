import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Se suscribe a cambios (INSERT/UPDATE/DELETE) en una o varias tablas de
 * Supabase y ejecuta onChange cada vez que algo cambia. Reemplaza el patrón
 * repetido de supabase.channel(...).on('postgres_changes', ...) que estaba
 * copiado en admin.js, juez.js y ranking.js.
 */
export function useRealtimeRefresh(channelName, tables, onChange) {
  useEffect(() => {
    const channel = supabase.channel(channelName)
    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        onChange
      )
    })
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName])
}
