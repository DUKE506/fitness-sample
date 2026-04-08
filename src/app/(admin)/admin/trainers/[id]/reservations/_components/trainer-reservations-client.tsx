'use client'

import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, ClipboardList } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeReservations } from '@/hooks/use-realtime-reservations'
import { DailyView } from '@/app/(admin)/admin/schedule/_components/daily-view'
import { WeeklyView } from '@/app/(admin)/admin/schedule/_components/weekly-view'
import { ReservationCard } from '@/components/schedule/reservation-card'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils/cn'
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  toDateString,
  formatKoreanDate,
} from '@/lib/utils/date'
import type { TrainerWithProfile, ReservationWithDetails } from '@/lib/types'

type ViewMode = 'daily' | 'weekly'

const VIEW_LABELS: Record<ViewMode, string> = {
  daily: '일간',
  weekly: '주간',
}

interface TrainerReservationsClientProps {
  trainer: TrainerWithProfile
}

export function TrainerReservationsClient({ trainer }: TrainerReservationsClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('daily')
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([])
  const [pendingReservations, setPendingReservations] = useState<ReservationWithDetails[]>([])
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
    } else {
      const ws = startOfWeek(selectedDate, { weekStartsOn: 0 })
      const we = endOfWeek(selectedDate, { weekStartsOn: 0 })
      query = query
        .gte('reservation_date', toDateString(ws))
        .lte('reservation_date', toDateString(we))
    }

    const { data } = await query.order('start_time', { ascending: true })
    setReservations((data ?? []) as ReservationWithDetails[])
    setLoading(false)
  }, [viewMode, selectedDate, trainer.id])

  const fetchPending = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reservations')
      .select('*, members(*, profiles(*)), trainers(*, profiles(*))')
      .eq('trainer_id', trainer.id)
      .eq('status', 'pending')
      .order('reservation_date', { ascending: true })
      .order('start_time', { ascending: true })

    setPendingReservations((data ?? []) as ReservationWithDetails[])
  }, [trainer.id])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  function handleStatusChange() {
    fetchReservations()
    fetchPending()
  }

  useRealtimeReservations(handleStatusChange)

  function navigate(direction: 1 | -1) {
    if (viewMode === 'daily') {
      setSelectedDate((d) => addDays(d, direction))
    } else {
      setSelectedDate((d) => addDays(d, direction * 7))
    }
  }

  function goToToday() {
    setSelectedDate(new Date())
  }

  function getPeriodLabel() {
    if (viewMode === 'daily') return formatKoreanDate(selectedDate)
    const ws = startOfWeek(selectedDate, { weekStartsOn: 0 })
    const we = endOfWeek(selectedDate, { weekStartsOn: 0 })
    return `${format(ws, 'M월 d일')} – ${format(we, 'M월 d일')}`
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          {trainer.profiles.name} 트레이너
        </h1>
        <p className="mt-1 text-slate-400 text-sm">스케줄 및 예약 요청 관리</p>
      </div>

      {/* ── PT 예약 요청 섹션 ─────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">예약 요청</h2>
          {pendingReservations.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {pendingReservations.length}
            </span>
          )}
        </div>

        {pendingReservations.length === 0 ? (
          <div className="rounded-2xl border border-white/12 bg-white/4 px-6 py-10 text-center text-slate-500 text-sm">
            대기 중인 예약 요청이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {pendingReservations.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                viewAs="trainer"
                showActions
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── 스케줄 섹션 ───────────────────────────────────── */}
      <section>
        {/* 섹션 헤더 + 뷰 탭 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-white">스케줄</h2>

          <div className="flex gap-1 bg-white/6 border border-white/12 rounded-xl p-1 self-start">
            {(['daily', 'weekly'] as ViewMode[]).map((v) => (
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

        {/* 날짜 네비게이션 */}
        <div className="flex items-center gap-3 mb-4">
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
            onClick={() => { fetchReservations(); fetchPending() }}
            className="ml-auto p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/8 transition-colors cursor-pointer"
            title="새로고침"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* 뷰 컨텐츠 */}
        {viewMode === 'daily' ? (
          <DailyView
            reservations={reservations}
            trainers={[trainer]}
            onStatusChange={handleStatusChange}
            viewAs="trainer"
          />
        ) : (
          <WeeklyView
            reservations={reservations}
            trainers={[trainer]}
            selectedTrainerId={trainer.id}
            onSelectTrainer={() => {}}
            selectedDate={selectedDate}
            onStatusChange={handleStatusChange}
            viewAs="trainer"
            hideTrainerFilter
          />
        )}
      </section>
    </div>
  )
}
