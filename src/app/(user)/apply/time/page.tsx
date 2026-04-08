'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import { useReservationStore } from '@/stores/use-reservation-store'
import { useAvailableSlots } from '@/hooks/use-available-slots'
import { CalendarView } from '@/components/schedule/calendar-view'
import { TimeSlotPicker } from '@/components/schedule/time-slot-picker'
import { cn } from '@/lib/utils/cn'
import { toDateString, format } from '@/lib/utils/date'
import { ko } from 'date-fns/locale'

const STEPS = ['트레이너 선택', '일정 선택', '신청 완료']

export default function ApplyTimePage() {
  const router = useRouter()
  const { selectedTrainer, selectedDate, selectedSlot, setSelectedDate, setSelectedSlot, setSelectedSlotEnd } =
    useReservationStore()

  const [dateStr, setDateStr] = useState<string | null>(
    selectedDate ? toDateString(selectedDate) : null,
  )

  const { slots, loading } = useAvailableSlots(selectedTrainer?.id ?? null, dateStr)

  // 트레이너 미선택 시 Step 1으로
  useEffect(() => {
    if (!selectedTrainer) {
      router.replace('/apply')
    }
  }, [selectedTrainer, router])

  function handleDateSelect(date: Date) {
    setSelectedDate(date)
    setSelectedSlot(null)
    setDateStr(toDateString(date))
  }

  function handleSlotSelect(slot: string) {
    setSelectedSlot(slot)
    const matched = slots.find((s) => s.start_time === slot)
    setSelectedSlotEnd(matched?.end_time ?? null)
  }

  function handleNext() {
    router.push('/apply/complete')
  }

  if (!selectedTrainer) return null

  const { profiles, profile_image_url, career_years } = selectedTrainer
  const canProceed = selectedDate !== null && selectedSlot !== null

  return (
    <div className="px-4 py-6 pb-36 space-y-6">
      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                  idx < 1
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                    : idx === 1
                      ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : 'bg-white/[0.08] border border-white/[0.12] text-slate-500',
                )}
              >
                {idx + 1}
              </div>
              <span
                className={`text-xs font-medium ${idx === 1 ? 'text-emerald-400' : 'text-slate-500'}`}
              >
                {step}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-white/[0.08] mx-2 mb-4" />
            )}
          </div>
        ))}
      </div>

      {/* 뒤로가기 */}
      <button
        onClick={() => router.push('/apply')}
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        트레이너 변경
      </button>

      {/* 선택된 트레이너 요약 */}
      <div className="bg-white/[0.08] backdrop-blur-[15px] border border-white/[0.12] rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <p className="text-xs text-slate-400 mb-3 font-medium">선택한 트레이너</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white/[0.08] border border-white/[0.12]">
            {profile_image_url ? (
              <Image
                src={profile_image_url}
                alt={profiles.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-base font-bold text-emerald-400">
                  {profiles.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{profiles.name}</p>
            <p className="text-xs text-slate-400">경력 {career_years ?? 0}년</p>
          </div>
        </div>
      </div>

      {/* 날짜 선택 */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">날짜 선택</h2>
        <CalendarView selectedDate={selectedDate} onSelect={handleDateSelect} />
      </div>

      {/* 시간 선택 */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">
          시간 선택
          {selectedDate && (
            <span className="ml-2 text-sm font-normal text-slate-400">
              {format(selectedDate, 'M월 d일 (eee)', { locale: ko })}
            </span>
          )}
        </h2>
        {!selectedDate ? (
          <p className="text-sm text-slate-500 py-4">날짜를 먼저 선택해주세요.</p>
        ) : (
          <div className="bg-white/[0.08] backdrop-blur-[15px] border border-white/[0.12] rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <TimeSlotPicker
              slots={slots}
              selectedSlot={selectedSlot}
              onSelect={handleSlotSelect}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* 하단 sticky 다음 버튼 */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center px-4 z-10">
        <button
          disabled={!canProceed}
          onClick={handleNext}
          className={cn(
            'w-full max-w-sm inline-flex items-center justify-center',
            'rounded-xl font-medium text-base px-6 py-3 transition-all duration-200',
            canProceed
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_8px_32px_rgba(16,185,129,0.3)]'
              : 'bg-white/[0.08] text-slate-500 cursor-not-allowed border border-white/[0.12]',
          )}
        >
          다음
        </button>
      </div>
    </div>
  )
}
