'use client'

import { useState, useTransition } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth } from 'date-fns'
import { ko } from 'date-fns/locale'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { upsertTrainerSchedules, upsertDayOff, deleteDayOff } from '@/actions/schedules'
import type { TrainerSchedule, TrainerDayOff } from '@/lib/types'

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const
const SLOT_OPTIONS = [30, 60, 90, 120] as const

const DEFAULT_START = '09:00'
const DEFAULT_END = '18:00'
const DEFAULT_SLOT = 60

// ─── 타입 ─────────────────────────────────────────────────────────────────────

type DayState = {
  is_active: boolean
  start_time: string
  end_time: string
  slot_duration_minutes: number
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ScheduleFormProps {
  trainerId: string
  schedules: TrainerSchedule[]
  dayOffs: TrainerDayOff[]
}

// ─── 근무시간 섹션 ─────────────────────────────────────────────────────────────

function WorkHoursSection({
  trainerId,
  schedules,
}: {
  trainerId: string
  schedules: TrainerSchedule[]
}) {
  const init = (): DayState[] =>
    Array.from({ length: 7 }, (_, dow) => {
      const existing = schedules.find((s) => s.day_of_week === dow)
      return {
        is_active: existing?.is_active ?? false,
        start_time: existing?.start_time?.slice(0, 5) ?? DEFAULT_START,
        end_time: existing?.end_time?.slice(0, 5) ?? DEFAULT_END,
        slot_duration_minutes: existing?.slot_duration_minutes ?? DEFAULT_SLOT,
      }
    })

  const [days, setDays] = useState<DayState[]>(init)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function update<K extends keyof DayState>(dow: number, key: K, value: DayState[K]) {
    setDays((prev) => prev.map((d, i) => (i === dow ? { ...d, [key]: value } : d)))
    setSaved(false)
  }

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await upsertTrainerSchedules(
        trainerId,
        days.map((d, dow) => ({ day_of_week: dow, ...d })),
      )
      if (!result.success) {
        setError(result.error)
      } else {
        setSaved(true)
      }
    })
  }

  return (
    <section className="rounded-2xl border border-white/12 bg-white/4 p-6 space-y-4">
      <h2 className="text-base font-semibold text-white">요일별 근무시간</h2>

      <div className="space-y-2">
        {days.map((day, dow) => (
          <div
            key={dow}
            className={cn(
              'flex flex-wrap items-center gap-3 rounded-xl px-4 py-3 transition-colors',
              day.is_active ? 'bg-white/6' : 'bg-white/2 opacity-60',
            )}
          >
            {/* 요일 토글 */}
            <button
              type="button"
              onClick={() => update(dow, 'is_active', !day.is_active)}
              className={cn(
                'w-10 h-10 rounded-full text-sm font-semibold shrink-0 transition-colors cursor-pointer',
                day.is_active
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/8 text-slate-400 hover:bg-white/12',
              )}
            >
              {DAY_LABELS[dow]}
            </button>

            {/* 시간 설정 */}
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <input
                type="time"
                value={day.start_time}
                onChange={(e) => update(dow, 'start_time', e.target.value)}
                disabled={!day.is_active}
                className="bg-white/6 border border-white/12 rounded-lg px-3 py-1.5 text-sm text-white disabled:opacity-40 focus:outline-none focus:border-emerald-500/50"
              />
              <span className="text-slate-500 text-sm">~</span>
              <input
                type="time"
                value={day.end_time}
                onChange={(e) => update(dow, 'end_time', e.target.value)}
                disabled={!day.is_active}
                className="bg-white/6 border border-white/12 rounded-lg px-3 py-1.5 text-sm text-white disabled:opacity-40 focus:outline-none focus:border-emerald-500/50"
              />

              {/* 슬롯 단위 */}
              <select
                value={day.slot_duration_minutes}
                onChange={(e) =>
                  update(dow, 'slot_duration_minutes', Number(e.target.value))
                }
                disabled={!day.is_active}
                className="bg-white/6 border border-white/12 rounded-lg px-3 py-1.5 text-sm text-white disabled:opacity-40 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                {SLOT_OPTIONS.map((m) => (
                  <option key={m} value={m} className="bg-neutral-900">
                    {m}분 단위
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}
      {saved && (
        <p className="text-emerald-400 text-xs">저장되었습니다.</p>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} isLoading={isPending}>
          근무시간 저장
        </Button>
      </div>
    </section>
  )
}

// ─── 휴무일 캘린더 섹션 ───────────────────────────────────────────────────────

function DayOffSection({
  trainerId,
  dayOffs: initialDayOffs,
}: {
  trainerId: string
  dayOffs: TrainerDayOff[]
}) {
  const [dayOffs, setDayOffs] = useState<TrainerDayOff[]>(initialDayOffs)
  const [viewDate, setViewDate] = useState(() => new Date())
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // 사유 입력 다이얼로그
  const [dialogDate, setDialogDate] = useState<string | null>(null)
  const [reasonInput, setReasonInput] = useState('')

  const offDates = new Set(dayOffs.map((d) => d.off_date))

  const calendarDays = (() => {
    const start = startOfMonth(viewDate)
    const end = endOfMonth(viewDate)
    const days = eachDayOfInterval({ start, end })
    const prefix = getDay(start)
    return { days, prefix }
  })()

  function handleDateClick(dateStr: string) {
    if (offDates.has(dateStr)) {
      // 해제
      startTransition(async () => {
        const result = await deleteDayOff(trainerId, dateStr)
        if (!result.success) {
          setError(result.error)
        } else {
          setDayOffs((prev) => prev.filter((d) => d.off_date !== dateStr))
          setError(null)
        }
      })
    } else {
      // 추가 → 다이얼로그
      setDialogDate(dateStr)
      setReasonInput('')
    }
  }

  function handleAddDayOff() {
    if (!dialogDate) return
    startTransition(async () => {
      const result = await upsertDayOff(trainerId, dialogDate, reasonInput || undefined)
      if (!result.success) {
        setError(result.error)
      } else {
        setDayOffs((prev) => [
          ...prev.filter((d) => d.off_date !== dialogDate),
          {
            id: crypto.randomUUID(),
            trainer_id: trainerId,
            off_date: dialogDate,
            reason: reasonInput || null,
            created_at: new Date().toISOString(),
          },
        ])
        setError(null)
        setDialogDate(null)
      }
    })
  }

  return (
    <section className="rounded-2xl border border-white/12 bg-white/4 p-6 space-y-4">
      <h2 className="text-base font-semibold text-white">휴무일 관리</h2>
      <p className="text-xs text-slate-500">날짜를 클릭하여 휴무일을 추가하거나 해제합니다.</p>

      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate((d) => subMonths(d, 1))}
          className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-white">
          {format(viewDate, 'yyyy년 M월', { locale: ko })}
        </span>
        <button
          type="button"
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              'text-xs font-medium py-1',
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-500',
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {/* 빈 칸 (prefix) */}
        {Array.from({ length: calendarDays.prefix }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {/* 날짜 */}
        {calendarDays.days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isOff = offDates.has(dateStr)
          const dow = getDay(day)
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleDateClick(dateStr)}
              disabled={isPending}
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer',
                isOff
                  ? 'bg-red-500/30 text-red-300 border border-red-500/40 font-semibold'
                  : cn(
                      'hover:bg-white/8',
                      dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-slate-300',
                    ),
                !isSameMonth(day, viewDate) && 'opacity-30',
              )}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>

      {/* 등록된 휴무일 목록 */}
      {dayOffs.length > 0 && (
        <div className="space-y-1 pt-2">
          <p className="text-xs text-slate-500 mb-2">등록된 휴무일</p>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {[...dayOffs]
              .sort((a, b) => a.off_date.localeCompare(b.off_date))
              .map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/4 text-sm"
                >
                  <div>
                    <span className="text-white font-medium">{d.off_date}</span>
                    {d.reason && (
                      <span className="ml-2 text-slate-400 text-xs">{d.reason}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDateClick(d.off_date)}
                    className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {/* 사유 입력 다이얼로그 */}
      <Dialog
        open={!!dialogDate}
        onClose={() => setDialogDate(null)}
        title="휴무일 추가"
        description={dialogDate ?? ''}
      >
        <div className="space-y-3">
          <label className="text-sm text-slate-300 block">
            사유 <span className="text-slate-500">(선택)</span>
          </label>
          <input
            autoFocus
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddDayOff()
            }}
            placeholder="예: 개인 사정, 교육 참석 등"
            className="w-full bg-white/6 border border-white/12 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogDate(null)}>
            취소
          </Button>
          <Button onClick={handleAddDayOff} isLoading={isPending}>
            추가
          </Button>
        </DialogFooter>
      </Dialog>
    </section>
  )
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export function ScheduleForm({ trainerId, schedules, dayOffs }: ScheduleFormProps) {
  return (
    <div className="space-y-6">
      <WorkHoursSection trainerId={trainerId} schedules={schedules} />
      <DayOffSection trainerId={trainerId} dayOffs={dayOffs} />
    </div>
  )
}
