'use client'

import { addDays, format, startOfWeek, isSameDay } from '@/lib/utils/date'
import { ReservationCard } from '@/components/schedule/reservation-card'
import { cn } from '@/lib/utils/cn'
import type { TrainerWithProfile, ReservationWithDetails } from '@/lib/types'

// 08:00 ~ 21:30, 30분 단위 (28 슬롯)
const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const h = Math.floor(i / 2) + 8
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

const WEEK_DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

interface WeeklyViewProps {
  reservations: ReservationWithDetails[]
  trainers: TrainerWithProfile[]
  selectedTrainerId: string
  onSelectTrainer: (id: string) => void
  selectedDate: Date
  onStatusChange: () => void
}

export function WeeklyView({
  reservations,
  trainers,
  selectedTrainerId,
  onSelectTrainer,
  selectedDate,
  onStatusChange,
}: WeeklyViewProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()

  function getReservation(date: Date, slot: string) {
    const dateStr = format(date, 'yyyy-MM-dd')
    return reservations.find(
      (r) => r.reservation_date === dateStr && r.start_time.slice(0, 5) === slot,
    )
  }

  return (
    <div className="space-y-4">
      {/* 트레이너 필터 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 shrink-0">트레이너</span>
        {trainers.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelectTrainer(t.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer',
              selectedTrainerId === t.id
                ? 'bg-emerald-500 text-white'
                : 'bg-white/8 text-slate-300 hover:bg-white/13 hover:text-white',
            )}
          >
            {t.profiles.name}
          </button>
        ))}
      </div>

      {/* 주간 그리드 */}
      <div className="overflow-x-auto rounded-2xl border border-white/12 bg-white/4">
        <table className="w-full text-sm border-collapse" style={{ minWidth: '640px' }}>
          <thead>
            <tr className="border-b border-white/10">
              <th className="sticky left-0 z-10 bg-[#0F0F0F] w-20 px-3 py-3 text-left text-slate-500 font-medium text-xs">
                시간
              </th>
              {days.map((day, i) => {
                const isToday = isSameDay(day, today)
                return (
                  <th
                    key={i}
                    className={cn(
                      'px-2 py-3 text-center font-medium text-xs border-l border-white/8 min-w-[90px]',
                      isToday ? 'text-emerald-400' : 'text-slate-300',
                    )}
                  >
                    <div>{WEEK_DAY_LABELS[i]}</div>
                    <div className={cn('mt-0.5 text-base font-semibold', isToday && 'text-emerald-400')}>
                      {format(day, 'd')}
                    </div>
                  </th>
                )
              })}
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
                {days.map((day, i) => {
                  const res = getReservation(day, slot)
                  return (
                    <td key={i} className="px-1.5 py-1.5 border-l border-white/8 align-top">
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
    </div>
  )
}
