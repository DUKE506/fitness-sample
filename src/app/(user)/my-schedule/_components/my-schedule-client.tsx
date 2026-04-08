'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, CalendarX, ArrowRightLeft, CalendarClock } from 'lucide-react'
import { ReservationCard } from '@/components/schedule/reservation-card'
import { DDayBadge } from '@/components/schedule/d-day-badge'
import { cancelReservation } from '@/actions/reservations'
import { cn } from '@/lib/utils/cn'
import type { ReservationWithDetails, PtPackageWithTrainer } from '@/lib/types'

interface Props {
  activePackage: PtPackageWithTrainer | null
  reservations: ReservationWithDetails[]
}

function PackageProgressBar({
  remaining,
  total,
}: {
  remaining: number
  total: number
}) {
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0
  const color =
    pct > 50
      ? 'bg-emerald-500'
      : pct > 20
        ? 'bg-amber-400'
        : 'bg-red-400'

  return (
    <div className="w-full h-2 rounded-full bg-white/8">
      <div
        className={cn('h-2 rounded-full transition-all duration-500', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function RescheduleButton({ reservationId }: { reservationId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await cancelReservation(reservationId)
      if (result.success) {
        router.push('/apply')
      } else {
        setError(result.error ?? '오류가 발생했습니다.')
        setConfirming(false)
      }
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 justify-end mt-2">
        {error && <p className="text-xs text-red-400 mr-auto">{error}</p>}
        <span className="text-xs text-slate-400">기존 예약을 취소하고 다시 신청할까요?</span>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1"
        >
          아니오
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className={cn(
            'text-xs px-3 py-1 rounded-lg font-medium transition-all duration-200',
            isPending
              ? 'bg-white/8 text-slate-500 cursor-not-allowed'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30',
          )}
        >
          {isPending ? '처리 중...' : '예, 변경할게요'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex justify-end mt-2">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1"
      >
        <ArrowRightLeft className="w-3.5 h-3.5" />
        예약 변경
      </button>
    </div>
  )
}

export function MyScheduleClient({ activePackage, reservations }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = reservations.filter(
    (r) =>
      (r.status === 'pending' || r.status === 'confirmed') &&
      new Date(r.reservation_date) >= today,
  )
  const past = reservations.filter(
    (r) =>
      r.status === 'cancelled' ||
      r.status === 'rejected' ||
      r.status === 'completed' ||
      (r.status !== 'pending' && r.status !== 'confirmed') ||
      new Date(r.reservation_date) < today,
  )

  const nextReservation = upcoming[0] ?? null

  return (
    <div className="px-4 py-6 pb-28 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">내 스케줄</h1>
        <p className="text-sm text-slate-400 mt-1">예약 현황과 PT 패키지를 확인하세요</p>
      </div>

      {/* PT 패키지 카드 */}
      {activePackage ? (
        <div className="bg-white/8 backdrop-blur-[15px] border border-white/12 rounded-2xl p-5 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">활성 PT 패키지</p>
                <p className="text-sm font-semibold text-white">
                  {activePackage.trainers.profiles.name} 트레이너
                </p>
              </div>
            </div>
            {activePackage.end_date && (
              <p className="text-xs text-slate-500 shrink-0">
                ~{activePackage.end_date}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">잔여 세션</span>
              <span className="text-white font-medium">
                {activePackage.remaining_sessions}
                <span className="text-slate-500 font-normal">
                  {' '}/ {activePackage.total_sessions}회
                </span>
              </span>
            </div>
            <PackageProgressBar
              remaining={activePackage.remaining_sessions}
              total={activePackage.total_sessions}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white/4 border border-white/8 rounded-2xl p-5 flex items-center gap-3">
          <Dumbbell className="w-5 h-5 text-slate-500 shrink-0" />
          <p className="text-sm text-slate-500">활성 PT 패키지가 없습니다.</p>
        </div>
      )}

      {/* 다음 예약 D-day 배너 */}
      {nextReservation && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalendarClock className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 mb-0.5">다음 예약</p>
              <p className="text-sm font-medium text-white">
                {nextReservation.reservation_date.replace(/-/g, '.')}
                <span className="text-slate-400 font-normal ml-2">
                  {nextReservation.start_time.slice(0, 5)}–
                  {nextReservation.end_time.slice(0, 5)}
                </span>
              </p>
            </div>
          </div>
          <DDayBadge targetDate={nextReservation.reservation_date} />
        </div>
      )}

      {/* 예정된 예약 */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300">예정된 예약</h2>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 bg-white/3 border border-white/8 rounded-2xl">
            <CalendarX className="w-8 h-8 text-slate-600" />
            <p className="text-sm text-slate-500">예정된 예약이 없습니다.</p>
            <a
              href="/apply"
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              PT 신청하기
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((reservation) => (
              <div key={reservation.id}>
                <ReservationCard
                  reservation={reservation}
                  viewAs="member"
                  showActions={true}
                />
                <RescheduleButton reservationId={reservation.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 지난 예약 */}
      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500">지난 예약</h2>
          <div className="space-y-2">
            {past.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                viewAs="member"
                showActions={false}
                className="opacity-60"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
