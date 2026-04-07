'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { success: true } | { success: false; error: string }

export type ScheduleRow = {
  day_of_week: number      // 0=일 ~ 6=토
  start_time: string       // "HH:mm"
  end_time: string         // "HH:mm"
  slot_duration_minutes: number
  is_active: boolean
}

export async function upsertTrainerSchedules(
  trainerId: string,
  rows: ScheduleRow[],
): Promise<ActionResult> {
  const supabase = await createClient()

  const records = rows.map((r) => ({
    trainer_id: trainerId,
    day_of_week: r.day_of_week,
    start_time: r.start_time,
    end_time: r.end_time,
    slot_duration_minutes: r.slot_duration_minutes,
    is_active: r.is_active,
  }))

  const { error } = await supabase
    .from('trainer_schedules')
    .upsert(records, { onConflict: 'trainer_id,day_of_week' })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/admin/trainers/${trainerId}/schedule`)
  return { success: true }
}

export async function upsertDayOff(
  trainerId: string,
  offDate: string,  // "YYYY-MM-DD"
  reason?: string,
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('trainer_day_offs')
    .upsert(
      { trainer_id: trainerId, off_date: offDate, reason: reason ?? null },
      { onConflict: 'trainer_id,off_date' },
    )

  if (error) return { success: false, error: error.message }

  revalidatePath(`/admin/trainers/${trainerId}/schedule`)
  return { success: true }
}

export async function deleteDayOff(
  trainerId: string,
  offDate: string,
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('trainer_day_offs')
    .delete()
    .eq('trainer_id', trainerId)
    .eq('off_date', offDate)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/admin/trainers/${trainerId}/schedule`)
  return { success: true }
}
