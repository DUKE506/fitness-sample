'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AvailableSlot } from '@/lib/types'

export function useAvailableSlots(trainerId: string | null, date: string | null) {
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!trainerId || !date) {
      setSlots([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const supabase = createClient()
    supabase
      .rpc('get_available_slots', {
        p_trainer_id: trainerId,
        p_date: date,
      })
      .then(({ data, error: rpcError }) => {
        if (cancelled) return
        if (rpcError) {
          setError(rpcError.message)
          setSlots([])
        } else {
          setSlots((data ?? []) as AvailableSlot[])
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [trainerId, date])

  return { slots, loading, error }
}
