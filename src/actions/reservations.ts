'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult =
  | { success: true; reservationId: string }
  | { success: false; error: string }

type SimpleResult =
  | { success: true }
  | { success: false; error: string }

// 트레이너/관리자가 회원의 예약을 직접 생성 (세션 차감 없음)
export async function createReservation(
  memberId: string,
  trainerId: string,
  ptPackageId: string | null,
  date: string,       // "YYYY-MM-DD"
  startTime: string,  // "HH:mm:ss"
  endTime: string,    // "HH:mm:ss"
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: '로그인이 필요합니다.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'trainer' && profile?.role !== 'admin') {
    return { success: false, error: '트레이너 또는 관리자만 예약을 생성할 수 있습니다.' }
  }

  const { data, error } = await supabase
    .from('reservations')
    .insert({
      member_id: memberId,
      trainer_id: trainerId,
      pt_package_id: ptPackageId,
      reservation_date: date,
      start_time: startTime,
      end_time: endTime,
      status: 'confirmed',
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/schedule')
  revalidatePath('/admin/trainers', 'layout')
  revalidatePath('/trainer/schedule')
  return { success: true, reservationId: data.id }
}

// 예약 완료 처리 — status → 'completed' + pt_package remaining_sessions 1 차감
export async function completeReservation(reservationId: string): Promise<SimpleResult> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: '로그인이 필요합니다.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'trainer' && profile?.role !== 'admin') {
    return { success: false, error: '트레이너 또는 관리자만 완료 처리할 수 있습니다.' }
  }

  // 예약 조회 (pt_package_id 필요)
  const { data: reservation, error: fetchError } = await supabase
    .from('reservations')
    .select('pt_package_id, status')
    .eq('id', reservationId)
    .single()

  if (fetchError || !reservation) {
    return { success: false, error: '예약 정보를 찾을 수 없습니다.' }
  }

  if (reservation.status !== 'confirmed') {
    return { success: false, error: '확정된 예약만 완료 처리할 수 있습니다.' }
  }

  // status → 'completed'
  const { error: updateError } = await supabase
    .from('reservations')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', reservationId)

  if (updateError) return { success: false, error: updateError.message }

  // PT 패키지 세션 차감
  if (reservation.pt_package_id) {
    const { data: pkg } = await supabase
      .from('pt_packages')
      .select('remaining_sessions')
      .eq('id', reservation.pt_package_id)
      .single()

    if (pkg && pkg.remaining_sessions > 0) {
      await supabase
        .from('pt_packages')
        .update({
          remaining_sessions: pkg.remaining_sessions - 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservation.pt_package_id)
    }
  }

  revalidatePath('/admin/schedule')
  revalidatePath('/admin/trainers', 'layout')
  revalidatePath('/trainer/schedule')
  return { success: true }
}

// 예약 취소 — 트레이너/관리자만 가능, 세션 복구 없음
export async function cancelReservation(reservationId: string): Promise<SimpleResult> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: '로그인이 필요합니다.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'trainer' && profile?.role !== 'admin') {
    return { success: false, error: '트레이너 또는 관리자만 예약을 취소할 수 있습니다.' }
  }

  const { error } = await supabase
    .from('reservations')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reservationId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/schedule')
  revalidatePath('/admin/trainers', 'layout')
  revalidatePath('/trainer/schedule')
  return { success: true }
}
