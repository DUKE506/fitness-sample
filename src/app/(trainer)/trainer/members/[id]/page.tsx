import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, User, Phone, CalendarClock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format'
import { RESERVATION_STATUS_LABEL } from '@/lib/constants'
import type { TrainerWithProfile } from '@/lib/types'
import type { BadgeVariant } from '@/components/ui/badge'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('members').select('profiles(name)').eq('id', id).single()
  const name = (data?.profiles as { name: string } | null)?.name ?? '회원'
  return { title: `${name} — 회원 상세` }
}

interface PackageRow {
  id: string
  total_sessions: number
  remaining_sessions: number
  price: number
  start_date: string
  end_date: string | null
  status: string
}

interface ReservationRow {
  id: string
  reservation_date: string
  start_time: string
  end_time: string
  status: string
}

const STATUS_BADGE_VARIANT: Record<string, BadgeVariant> = {
  pending: 'pending',
  confirmed: 'confirmed',
  rejected: 'rejected',
  cancelled: 'cancelled',
  completed: 'completed',
}

const PACKAGE_STATUS_LABEL: Record<string, string> = {
  active: '진행중',
  completed: '완료',
  cancelled: '취소',
  expired: '만료',
}

const PACKAGE_STATUS_VARIANT: Record<string, BadgeVariant> = {
  active: 'success',
  completed: 'completed',
  cancelled: 'cancelled',
  expired: 'muted',
}

function formatTime(time: string) {
  return time.slice(0, 5)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function calcDday(dateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'D-Day'
  if (diff > 0) return `D-${diff}`
  return `D+${Math.abs(diff)}`
}

export default async function TrainerMemberDetailPage({ params }: Props) {
  const { id } = await params
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

  const [memberRes, packagesRes, reservationsRes] = await Promise.all([
    supabase
      .from('members')
      .select('id, assigned_trainer_id, member_type, join_date, created_at, profiles(name, phone)')
      .eq('id', id)
      .single(),
    supabase
      .from('pt_packages')
      .select('id, total_sessions, remaining_sessions, price, start_date, end_date, status')
      .eq('member_id', id)
      .eq('trainer_id', trainer.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('reservations')
      .select('id, reservation_date, start_time, end_time, status')
      .eq('member_id', id)
      .eq('trainer_id', trainer.id)
      .order('reservation_date', { ascending: false })
      .order('start_time', { ascending: false }),
  ])

  if (memberRes.error || !memberRes.data) notFound()

  // 담당 트레이너 확인
  if (memberRes.data.assigned_trainer_id !== trainer.id) notFound()

  const member = memberRes.data
  const memberProfiles = member.profiles as { name: string; phone: string | null } | null
  const memberName = memberProfiles?.name ?? '-'
  const memberPhone = memberProfiles?.phone ?? null

  const packages = (packagesRes.data ?? []) as PackageRow[]
  const reservations = (reservationsRes.data ?? []) as ReservationRow[]

  const activePackage = packages.find((p) => p.status === 'active') ?? null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingReservation =
    reservations
      .filter(
        (r) =>
          (r.status === 'confirmed' || r.status === 'pending') &&
          new Date(r.reservation_date) >= today,
      )
      .sort((a, b) => a.reservation_date.localeCompare(b.reservation_date))[0] ?? null

  return (
    <div className="p-5 pb-28 w-full max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          href="/trainer/members"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          담당 회원 목록
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{memberName}</h1>
          <Badge variant={member.member_type === 'pt' ? 'primary' : 'default'}>
            {member.member_type === 'pt' ? 'PT' : '일반'}
          </Badge>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] p-5 mb-4">
        <h2 className="text-sm font-semibold text-white mb-4">기본 정보</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <dt className="text-xs text-slate-500 mb-0.5">이름</dt>
              <dd className="text-sm text-white">{memberName}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <dt className="text-xs text-slate-500 mb-0.5">연락처</dt>
              <dd className="text-sm text-white">{memberPhone ?? '-'}</dd>
            </div>
          </div>
        </dl>
      </div>

      {/* PT 패키지 현황 */}
      <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] p-5 mb-4">
        <h2 className="text-sm font-semibold text-white mb-4">PT 패키지</h2>

        {/* 현재 활성 패키지 */}
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">현재 패키지</p>
        {activePackage ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4 mb-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-slate-400 mt-0.5">만료일: {activePackage.end_date ?? '없음'}</p>
              </div>
              <Badge variant="success">진행중</Badge>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>잔여 세션</span>
                <span className="text-white font-medium">
                  {activePackage.remaining_sessions} / {activePackage.total_sessions}회
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{
                    width: `${(activePackage.remaining_sessions / activePackage.total_sessions) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 pt-1">
                <span>사용: {activePackage.total_sessions - activePackage.remaining_sessions}회</span>
                <span>{formatCurrency(activePackage.price)}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-4 text-center mb-5">등록된 패키지가 없습니다.</p>
        )}

        {/* 패키지 이력 */}
        {packages.length > 0 && (
          <>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">이력</p>
            <div className="divide-y divide-white/[0.06]">
              {packages.map((pkg) => (
                <div key={pkg.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">
                      {pkg.start_date} · {formatCurrency(pkg.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400">
                      {pkg.remaining_sessions}/{pkg.total_sessions}회
                    </span>
                    <Badge variant={PACKAGE_STATUS_VARIANT[pkg.status] ?? 'default'}>
                      {PACKAGE_STATUS_LABEL[pkg.status] ?? pkg.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 예약 이력 */}
      <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] p-5">
        <h2 className="text-sm font-semibold text-white mb-4">예약 이력</h2>

        {/* 다음 예약 D-day */}
        {upcomingReservation && (
          <div className="mb-5 rounded-xl border border-blue-500/20 bg-blue-500/[0.05] p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarClock className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">다음 예약</p>
                <p className="text-sm font-medium text-white">
                  {formatDate(upcomingReservation.reservation_date)}
                  <span className="text-slate-400 font-normal ml-2">
                    {formatTime(upcomingReservation.start_time)}–
                    {formatTime(upcomingReservation.end_time)}
                  </span>
                </p>
              </div>
            </div>
            <span className="text-lg font-bold text-blue-400 shrink-0">
              {calcDday(upcomingReservation.reservation_date)}
            </span>
          </div>
        )}

        {reservations.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">예약 이력이 없습니다.</p>
        ) : (
          <div className="relative pl-5 border-l border-white/[0.08]">
            {reservations.map((r) => (
              <div key={r.id} className="relative flex items-start gap-4 pb-5">
                <span className="absolute -left-[1.3125rem] top-1 w-2.5 h-2.5 rounded-full border-2 border-slate-600 bg-slate-900 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs text-slate-500">
                      {formatDate(r.reservation_date)}{' '}
                      {formatTime(r.start_time)}–{formatTime(r.end_time)}
                    </p>
                    <Badge variant={STATUS_BADGE_VARIANT[r.status] ?? 'default'}>
                      {RESERVATION_STATUS_LABEL[r.status as keyof typeof RESERVATION_STATUS_LABEL] ??
                        r.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
