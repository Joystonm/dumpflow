import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useDropsStore } from '../store'
import { fetchDrops, fetchSpaces } from '../services/drops'

export function useRealtime(userId) {
  const { setDrops, setSpaces, addDrop, updateDrop, removeDrop } = useDropsStore()

  useEffect(() => {
    if (!userId) return

    fetchDrops(userId).then(setDrops)
    fetchSpaces(userId).then(setSpaces)

    const channel = supabase
      .channel(`drops:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'drops', filter: `user_id=eq.${userId}`
      }, ({ new: drop }) => addDrop(drop))
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'drops', filter: `user_id=eq.${userId}`
      }, ({ new: drop }) => updateDrop(drop.id, drop))
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'drops', filter: `user_id=eq.${userId}`
      }, ({ old }) => removeDrop(old.id))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])
}
