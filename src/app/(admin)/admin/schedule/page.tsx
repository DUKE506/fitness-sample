import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ScheduleClient } from './_components/schedule-client'
import type { TrainerWithProfile } from '@/lib/types'

export const metadata: Metadata = {
  title: '전체 스케줄',
}

export default async function AdminSchedulePage() {
  const supabase = await createClient()

  const { data: trainers } = await supabase
    .from('trainers')
    .select('*, profiles(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const list = (trainers ?? []) as TrainerWithProfile[]

  return <ScheduleClient trainers={list} />
}
