import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import type { TrainerWithProfile } from '@/lib/types'

export const metadata: Metadata = {
  title: '담당 회원',
}

interface MemberListRow {
  id: string
  profiles: { name: string; phone: string | null }
  member_type: string
  pt_packages: { status: string; remaining_sessions: number; total_sessions: number }[]
  reservations: { reservation_date: string; status: string }[]
}

function getNextReservation(reservations: { reservation_date: string; status: string }[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return (
    reservations
      .filter(
        (r) =>
          (r.status === 'confirmed' || r.status === 'pending') &&
          new Date(r.reservation_date) >= today,
      )
      .sort((a, b) => a.reservation_date.localeCompare(b.reservation_date))[0] ?? null
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default async function TrainerMembersPage() {
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
    .select(
      'id, profiles(name, phone), member_type, pt_packages(status, remaining_sessions, total_sessions), reservations(reservation_date, status)',
    )
    .eq('assigned_trainer_id', trainer.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const members = (membersData ?? []) as unknown as MemberListRow[]

  return (
    <div className="p-5 pb-28">
      <h1 className="text-2xl font-bold text-white mb-6">담당 회원</h1>

      {members.length === 0 ? (
        <div className="text-center py-20 text-slate-500 text-sm">담당 회원이 없습니다.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {members.map((member) => {
            const activePackage = member.pt_packages.find((p) => p.status === 'active') ?? null
            const nextReservation = getNextReservation(member.reservations)
            const remaining = activePackage?.remaining_sessions ?? null

            return (
              <Link
                key={member.id}
                href={`/trainer/members/${member.id}`}
                className="block rounded-2xl border border-white/[0.12] bg-white/[0.04] p-4 hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-white">{member.profiles?.name ?? '-'}</p>
                      <Badge variant={member.member_type === 'pt' ? 'primary' : 'default'}>
                        {member.member_type === 'pt' ? 'PT' : '일반'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {nextReservation
                        ? `다음 예약: ${formatDate(nextReservation.reservation_date)}`
                        : '예정된 예약 없음'}
                    </p>
                  </div>

                  {activePackage ? (
                    <div className="shrink-0 text-right">
                      <p
                        className={`text-sm font-bold ${
                          remaining === 0
                            ? 'text-red-400'
                            : remaining !== null && remaining <= 3
                              ? 'text-orange-400'
                              : 'text-emerald-400'
                        }`}
                      >
                        {remaining}회 남음
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        총 {activePackage.total_sessions}회
                      </p>
                    </div>
                  ) : (
                    <div className="shrink-0">
                      <Badge variant="muted">패키지 없음</Badge>
                    </div>
                  )}
                </div>

                {activePackage && remaining !== null && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          remaining === 0
                            ? 'bg-red-500'
                            : remaining <= 3
                              ? 'bg-orange-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${(activePackage.remaining_sessions / activePackage.total_sessions) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
