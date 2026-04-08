import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MyScheduleClient } from './_components/my-schedule-client'
import type { ReservationWithDetails, PtPackageWithTrainer } from '@/lib/types'

export default async function MySchedulePage() {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // 현재 유저의 member 레코드
  const { data: member } = await adminClient
    .from('members')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!member) {
    return (
      <div className="px-4 py-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-slate-400 text-sm">회원 정보를 찾을 수 없습니다.</p>
      </div>
    )
  }

  // 활성 PT 패키지 (최신 1개)
  const { data: activePackageRaw } = await adminClient
    .from('pt_packages')
    .select('*, trainers(*, profiles(*))')
    .eq('member_id', member.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 전체 예약 목록 (날짜 오름차순)
  const { data: reservationsRaw } = await adminClient
    .from('reservations')
    .select('*, members(*, profiles(*)), trainers(*, profiles(*)), pt_packages(*)')
    .eq('member_id', member.id)
    .order('reservation_date', { ascending: true })
    .order('start_time', { ascending: true })

  const activePackage = activePackageRaw as PtPackageWithTrainer | null
  const reservations = (reservationsRaw ?? []) as ReservationWithDetails[]

  return (
    <MyScheduleClient
      activePackage={activePackage}
      reservations={reservations}
    />
  )
}
