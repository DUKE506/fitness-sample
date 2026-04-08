'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult =
  | { success: true; reservationId: string }
  | { success: false; error: string }

type SimpleResult =
  | { success: true }
  | { success: false; error: string }

export async function createReservation(
  trainerId: string,
  date: string,       // "YYYY-MM-DD"
  startTime: string,  // "HH:mm:ss"
  endTime: string,    // "HH:mm:ss"
): Promise<ActionResult> {
  const supabase = await createClient()

  // 현재 로그인 유저 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: '로그인이 필요합니다.' }
  }

  // members 테이블에서 member_id 조회
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (memberError || !member) {
    return { success: false, error: '회원 정보를 찾을 수 없습니다.' }
  }

  // 활성 PT 패키지 조회 (해당 트레이너)
  const { data: pkg, error: pkgError } = await supabase
    .from('pt_packages')
    .select('id')
    .eq('member_id', member.id)
    .eq('trainer_id', trainerId)
    .eq('status', 'active')
    .gt('remaining_sessions', 0)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (pkgError || !pkg) {
    return {
      success: false,
      error: '담당 트레이너의 활성 PT 패키지가 없습니다. 관리자에게 문의해주세요.',
    }
  }

  // 예약 생성 RPC 호출
  const { data: reservationId, error: rpcError } = await supabase.rpc(
    'create_reservation_with_session_decrement',
    {
      p_member_id: member.id,
      p_trainer_id: trainerId,
      p_pt_package_id: pkg.id,
      p_date: date,
      p_start_time: startTime,
      p_end_time: endTime,
    },
  )

  if (rpcError) {
    if (rpcError.message.includes('No remaining sessions')) {
      return { success: false, error: '잔여 PT 세션이 없습니다.' }
    }
    return { success: false, error: rpcError.message }
  }

  revalidatePath('/my-schedule')
  return { success: true, reservationId: reservationId as string }
}

export async function approveReservation(reservationId: string): Promise<SimpleResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('reservations')
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', reservationId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/my-schedule')
  revalidatePath('/admin/schedule')
  revalidatePath('/admin/trainers', 'layout')
  return { success: true }
}

export async function rejectReservation(reservationId: string): Promise<SimpleResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('reservations')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', reservationId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/my-schedule')
  revalidatePath('/admin/schedule')
  revalidatePath('/admin/trainers', 'layout')
  return { success: true }
}

export async function cancelReservation(reservationId: string): Promise<SimpleResult> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: '로그인이 필요합니다.' }

  const { error } = await supabase.rpc('cancel_reservation_with_session_restore', {
    p_reservation_id: reservationId,
    p_cancel_reason: undefined,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/my-schedule')
  revalidatePath('/admin/schedule')
  return { success: true }
}
