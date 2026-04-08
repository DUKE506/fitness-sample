'use client'

import { ReservationCard } from '@/components/schedule/reservation-card'
import { cn } from '@/lib/utils/cn'
import type { TrainerWithProfile, ReservationWithDetails } from '@/lib/types'

// 08:00 ~ 21:30, 30분 단위 (28 슬롯)
const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const h = Math.floor(i / 2) + 8
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

interface DailyViewProps {
  reservations: ReservationWithDetails[]
  trainers: TrainerWithProfile[]
  onStatusChange: () => void
}

export function DailyView({ reservations, trainers, onStatusChange }: DailyViewProps) {
  if (trainers.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        활성 트레이너가 없습니다.
      </div>
    )
  }

  function getReservation(trainerId: string, slot: string) {
    return reservations.find(
      (r) => r.trainer_id === trainerId && r.start_time.slice(0, 5) === slot,
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/12 bg-white/4">
      <table className="w-full text-sm border-collapse" style={{ minWidth: `${80 + trainers.length * 180}px` }}>
        <thead>
          <tr className="border-b border-white/10">
            <th className="sticky left-0 z-10 bg-[#0F0F0F] w-20 px-3 py-3 text-left text-slate-500 font-medium text-xs">
              시간
            </th>
            {trainers.map((t) => (
              <th
                key={t.id}
                className="px-3 py-3 text-left text-slate-300 font-medium text-xs border-l border-white/8 min-w-[180px]"
              >
                {t.profiles.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((slot, idx) => (
            <tr
              key={slot}
              className={cn(
                'border-b border-white/6 last:border-0',
                idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]',
              )}
            >
              <td className="sticky left-0 z-10 bg-inherit w-20 px-3 py-2 text-xs text-slate-500 align-top whitespace-nowrap">
                {slot}
              </td>
              {trainers.map((t) => {
                const res = getReservation(t.id, slot)
                return (
                  <td
                    key={t.id}
                    className="px-2 py-1.5 border-l border-white/8 align-top"
                  >
                    {res && (
                      <ReservationCard
                        reservation={res}
                        viewAs="admin"
                        showActions
                        onStatusChange={onStatusChange}
                        className="text-xs"
                      />
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
