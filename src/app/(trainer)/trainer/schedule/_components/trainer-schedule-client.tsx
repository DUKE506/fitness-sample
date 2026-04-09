'use client'

import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeReservations } from '@/hooks/use-realtime-reservations'
import { DailyView } from '@/app/(admin)/admin/schedule/_components/daily-view'
import { WeeklyView } from '@/app/(admin)/admin/schedule/_components/weekly-view'
import { MonthlyView } from '@/app/(admin)/admin/schedule/_components/monthly-view'
import { CreateReservationModal } from './create-reservation-modal'
import { TodaySessions } from './today-sessions'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils/cn'
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addMonths,
  subMonths,
  toDateString,
  formatKoreanDate,
} from '@/lib/utils/date'
import type { TrainerWithProfile, MemberWithProfile, ReservationWithDetails } from '@/lib/types'

type ViewMode = 'daily' | 'weekly' | 'monthly'

const VIEW_LABELS: Record<ViewMode, string> = {
  daily: '일간',
  weekly: '주간',
  monthly: '월간',
}

interface TrainerScheduleClientProps {
  trainer: TrainerWithProfile
  members: MemberWithProfile[]
}

export function TrainerScheduleClient({ trainer, members }: TrainerScheduleClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('daily')
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([])
  const [loading, setLoading] = useState(false)

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('reservations')
      .select('*, members(*, profiles(*)), trainers(*, profiles(*))')
      .eq('trainer_id', trainer.id)
      .in('status', ['pending', 'confirmed', 'completed'])

    if (viewMode === 'daily') {
      query = query.eq('reservation_date', toDateString(selectedDate))
    } else if (viewMode === 'weekly') {
      const ws = startOfWeek(selectedDate, { weekStartsOn: 0 })
      const we = endOfWeek(selectedDate, { weekStartsOn: 0 })
      query = query
        .gte('reservation_date', toDateString(ws))
        .lte('reservation_date', toDateString(we))
    } else {
      const ms = startOfMonth(selectedDate)
      const me = endOfMonth(selectedDate)
      query = query
        .gte('reservation_date', toDateString(ms))
        .lte('reservation_date', toDateString(me))
    }

    const { data } = await query.order('start_time', { ascending: true })
    setReservations((data ?? []) as ReservationWithDetails[])
    setLoading(false)
  }, [viewMode, selectedDate, trainer.id])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  useRealtimeReservations(fetchReservations)

  function navigate(direction: 1 | -1) {
    if (viewMode === 'daily') {
      setSelectedDate((d) => addDays(d, direction))
    } else if (viewMode === 'weekly') {
      setSelectedDate((d) => addDays(d, direction * 7))
    } else {
      setSelectedDate((d) =>
        direction === 1 ? addMonths(d, 1) : subMonths(d, 1),
      )
    }
  }

  function goToToday() {
    setSelectedDate(new Date())
  }

  function getPeriodLabel() {
    if (viewMode === 'daily') return formatKoreanDate(selectedDate)
    if (viewMode === 'weekly') {
      const ws = startOfWeek(selectedDate, { weekStartsOn: 0 })
      const we = endOfWeek(selectedDate, { weekStartsOn: 0 })
      return `${format(ws, 'M월 d일')} – ${format(we, 'M월 d일')}`
    }
    return format(selectedDate, 'yyyy년 M월')
  }

  function handleMonthDaySelect(date: Date) {
    setSelectedDate(date)
    setViewMode('daily')
  }

  const todayStr = toDateString(new Date())
  const isViewingToday = viewMode === 'daily' && toDateString(selectedDate) === todayStr
  const todayConfirmed = reservations.filter(
    (r) => r.reservation_date === todayStr && r.status === 'confirmed',
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">내 스케줄</h1>
          <p className="mt-1 text-slate-400 text-sm">
            담당 회원 {members.length}명
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          {/* 예약 생성 버튼 */}
          <CreateReservationModal
            trainerId={trainer.id}
            members={members}
            onSuccess={fetchReservations}
          />

          {/* 뷰 탭 */}
          <div className="flex gap-1 bg-white/6 border border-white/12 rounded-xl p-1">
            {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setViewMode(v)}
                className={cn(
                  'px-4 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 cursor-pointer',
                  viewMode === v
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/8',
                )}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 날짜 네비게이션 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-white font-semibold min-w-[160px] text-center">
          {getPeriodLabel()}
        </span>

        <button
          type="button"
          onClick={() => navigate(1)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={goToToday}
          className="ml-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/8 border border-white/12 transition-colors cursor-pointer"
        >
          오늘
        </button>

        {loading && <Spinner size="sm" className="ml-2" />}

        <button
          type="button"
          onClick={fetchReservations}
          className="ml-auto p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/8 transition-colors cursor-pointer"
          title="새로고침"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 오늘 PT 목록 (일간 뷰 + 오늘인 경우만) */}
      {isViewingToday && (
        <TodaySessions
          reservations={todayConfirmed}
          onStatusChange={fetchReservations}
        />
      )}

      {/* 뷰 컨텐츠 */}
      {viewMode === 'daily' && (
        <DailyView
          reservations={reservations}
          trainers={[trainer]}
          onStatusChange={fetchReservations}
          viewAs="trainer"
        />
      )}
      {viewMode === 'weekly' && (
        <WeeklyView
          reservations={reservations}
          trainers={[trainer]}
          selectedTrainerId={trainer.id}
          onSelectTrainer={() => {}}
          selectedDate={selectedDate}
          onStatusChange={fetchReservations}
          viewAs="trainer"
          hideTrainerFilter
        />
      )}
      {viewMode === 'monthly' && (
        <MonthlyView
          reservations={reservations}
          currentMonth={selectedDate}
          onSelectDate={handleMonthDaySelect}
        />
      )}
    </div>
  )
}
