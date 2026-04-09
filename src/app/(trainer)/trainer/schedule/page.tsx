import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TrainerScheduleClient } from './_components/trainer-schedule-client'
import type { TrainerWithProfile, MemberWithProfile } from '@/lib/types'

export const metadata: Metadata = {
  title: '내 스케줄',
}

export default async function TrainerSchedulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: trainerData } = await supabase
    .from('trainers')
    .select('*, profiles(*)')
    .eq('profile_id', user.id)
    .single()

  if (!trainerData) redirect('/login')

  const trainer = trainerData as TrainerWithProfile

  const { data: membersData } = await supabase
    .from('members')
    .select('*, profiles(*)')
    .eq('assigned_trainer_id', trainer.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const members = (membersData ?? []) as MemberWithProfile[]

  return <TrainerScheduleClient trainer={trainer} members={members} />
}
