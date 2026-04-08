'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
} from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'

interface CalendarViewProps {
  selectedDate: Date | null
  onSelect: (date: Date) => void
}

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토']

export function CalendarView({ selectedDate, onSelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

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

  function isPastDate(date: Date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d < today
  }

  return (
    <div className="bg-white/[0.08] backdrop-blur-[15px] border border-white/[0.12] rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-white">
          {format(currentMonth, 'yyyy년 M월')}
        </span>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-xs text-slate-500 py-1 font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((date) => {
          const isCurrentMonth = isSameMonth(date, currentMonth)
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
          const isDisabled = isPastDate(date)
          const isTodayDate = isToday(date)

          return (
            <button
              key={date.toISOString()}
              disabled={isDisabled}
              onClick={() => onSelect(date)}
              className={cn(
                'flex items-center justify-center h-9 w-full rounded-xl text-sm transition-all duration-150',
                !isCurrentMonth && 'opacity-0 pointer-events-none',
                isDisabled && 'text-slate-600 cursor-not-allowed',
                !isDisabled && !isSelected && 'text-slate-300 hover:bg-white/[0.08] hover:text-white',
                isTodayDate && !isSelected && 'text-emerald-400 font-semibold',
                isSelected &&
                  'bg-emerald-500 text-white font-semibold shadow-[0_2px_8px_rgba(16,185,129,0.4)]',
              )}
            >
              {format(date, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
