'use client'

import { CalendarClock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RESERVATION_STATUS_LABEL } from '@/lib/constants'
import type { BadgeVariant } from '@/components/ui/badge'

export interface ReservationHistoryRow {
  id: string
  reservation_date: string
  start_time: string
  end_time: string
  status: string
  trainers: {
    profiles: { name: string }
  }
}

interface Props {
  reservations: ReservationHistoryRow[]
}

const STATUS_BADGE_VARIANT: Record<string, BadgeVariant> = {
  pending: 'pending',
  confirmed: 'confirmed',
  rejected: 'rejected',
  cancelled: 'cancelled',
  completed: 'completed',
  no_show: 'muted',
}

const STATUS_LABEL: Record<string, string> = {
  ...RESERVATION_STATUS_LABEL,
  no_show: '노쇼',
}

function formatTime(time: string) {
  return time.slice(0, 5)
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

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function ReservationHistorySection({ reservations }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = reservations
    .filter(
      (r) =>
        (r.status === 'confirmed' || r.status === 'pending') &&
        new Date(r.reservation_date) >= today,
    )
    .sort((a, b) => a.reservation_date.localeCompare(b.reservation_date))[0] ?? null

  return (
    <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] p-6 mt-6">
      <h2 className="text-base font-semibold text-white mb-5">예약 이력</h2>

      {/* 다음 예약 D-day */}
      {upcoming && (
        <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/[0.05] p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalendarClock className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 mb-0.5">다음 예약</p>
              <p className="text-sm font-medium text-white">
                {upcoming.trainers.profiles.name} 트레이너
                <span className="text-slate-400 font-normal ml-2">
                  {formatDate(upcoming.reservation_date)}{' '}
                  {formatTime(upcoming.start_time)}–{formatTime(upcoming.end_time)}
                </span>
              </p>
            </div>
          </div>
          <span className="text-lg font-bold text-blue-400 shrink-0">
            {calcDday(upcoming.reservation_date)}
          </span>
        </div>
      )}

      {/* 타임라인 */}
      {reservations.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center">예약 이력이 없습니다.</p>
      ) : (
        <div className="relative pl-5 border-l border-white/[0.08]">
          {reservations.map((r, i) => (
            <div
              key={r.id}
              className={`relative flex items-start gap-4 pb-5 ${i === reservations.length - 1 ? '' : ''}`}
            >
              {/* 마커 */}
              <span className="absolute -left-[1.3125rem] top-1 w-2.5 h-2.5 rounded-full border-2 border-slate-600 bg-slate-900 shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm text-white font-medium">
                      {r.trainers.profiles.name} 트레이너
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(r.reservation_date)}{' '}
                      {formatTime(r.start_time)}–{formatTime(r.end_time)}
                    </p>
                  </div>
                  <Badge variant={STATUS_BADGE_VARIANT[r.status] ?? 'default'}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
