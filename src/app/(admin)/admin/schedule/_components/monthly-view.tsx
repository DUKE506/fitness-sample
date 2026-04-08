'use client'

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
} from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import type { ReservationWithDetails } from '@/lib/types'

const WEEK_DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

interface MonthlyViewProps {
  reservations: ReservationWithDetails[]
  currentMonth: Date
  onSelectDate: (date: Date) => void
}

export function MonthlyView({ reservations, currentMonth, onSelectDate }: MonthlyViewProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days: Date[] = []
  let cursor = calStart
  while (cursor <= calEnd) {
    days.push(new Date(cursor))
    cursor = addDays(cursor, 1)
  }

  // 날짜별 예약 집계
  const countByDate = reservations.reduce(
    (acc, r) => {
      const key = r.reservation_date
      if (!acc[key]) acc[key] = { pending: 0, confirmed: 0 }
      if (r.status === 'pending') acc[key].pending++
      else if (r.status === 'confirmed') acc[key].confirmed++
      return acc
    },
    {} as Record<string, { pending: number; confirmed: number }>,
  )

  return (
    <div className="rounded-2xl border border-white/12 bg-white/4 overflow-hidden">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-white/10">
        {WEEK_DAY_LABELS.map((d) => (
          <div
            key={d}
            className="py-3 text-center text-xs font-medium text-slate-500"
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          const isCurrentMonth = isSameMonth(date, currentMonth)
          const isTodayDate = isToday(date)
          const dateStr = format(date, 'yyyy-MM-dd')
          const counts = countByDate[dateStr]
          const total = counts ? counts.pending + counts.confirmed : 0

          return (
            <button
              key={i}
              type="button"
              disabled={!isCurrentMonth}
              onClick={() => onSelectDate(date)}
              className={cn(
                'min-h-[80px] p-2 text-left border-r border-b border-white/6',
                'last:border-r-0 transition-colors duration-150',
                isCurrentMonth
                  ? 'hover:bg-white/5 cursor-pointer'
                  : 'opacity-0 pointer-events-none',
              )}
            >
              {isCurrentMonth && (
                <>
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium',
                      isTodayDate
                        ? 'bg-emerald-500 text-white'
                        : 'text-slate-300',
                    )}
                  >
                    {format(date, 'd')}
                  </span>
                  {total > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      {counts.confirmed > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <span className="text-xs text-emerald-300 leading-none">
                            확정 {counts.confirmed}
                          </span>
                        </div>
                      )}
                      {counts.pending > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span className="text-xs text-amber-300 leading-none">
                            대기 {counts.pending}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
