'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle, AlertCircle, Calendar, Clock, User } from 'lucide-react'
import { useReservationStore } from '@/stores/use-reservation-store'
import { createReservation } from '@/actions/reservations'
import { cn } from '@/lib/utils/cn'
import { toDateString, format } from '@/lib/utils/date'
import { ko } from 'date-fns/locale'

const STEPS = ['트레이너 선택', '일정 선택', '신청 완료']

function formatSlotTime(timeStr: string): string {
  const parts = timeStr.split(':')
  const hour = parseInt(parts[0])
  const min = parts[1]
  const ampm = hour < 12 ? '오전' : '오후'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${ampm} ${displayHour}:${min}`
}

export default function ApplyCompletePage() {
  const router = useRouter()
  const {
    selectedTrainer,
    selectedDate,
    selectedSlot,
    selectedSlotEnd,
    reset,
  } = useReservationStore()

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedTrainer || !selectedDate || !selectedSlot || !selectedSlotEnd) {
      router.replace('/apply')
    }
  }, [selectedTrainer, selectedDate, selectedSlot, selectedSlotEnd, router])

  if (!selectedTrainer || !selectedDate || !selectedSlot || !selectedSlotEnd) return null

  const { profiles, profile_image_url, career_years } = selectedTrainer

  async function handleSubmit() {
    if (!selectedTrainer || !selectedDate || !selectedSlot || !selectedSlotEnd) return
    setStatus('loading')
    setErrorMessage(null)

    const result = await createReservation(
      selectedTrainer.id,
      toDateString(selectedDate),
      selectedSlot,
      selectedSlotEnd,
    )

    if (result.success) {
      setStatus('success')
    } else {
      setStatus('error')
      setErrorMessage(result.error)
    }
  }

  function handleGoToSchedule() {
    reset()
    router.push('/my-schedule')
  }

  if (status === 'success') {
    return (
      <div className="px-4 py-6 pb-24 flex flex-col items-center justify-center min-h-[70vh] space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_32px_rgba(16,185,129,0.3)]">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">신청 완료!</h1>
          <p className="text-sm text-slate-400">
            PT 신청이 접수되었습니다.
            <br />
            트레이너 승인 후 일정이 확정됩니다.
          </p>
        </div>
        <div className="bg-white/[0.08] backdrop-blur-[15px] border border-white/[0.12] rounded-2xl p-4 w-full max-w-sm text-left space-y-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400">트레이너</span>
            <span className="ml-auto text-white font-medium">{profiles.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400">날짜</span>
            <span className="ml-auto text-white font-medium">
              {format(selectedDate, 'yyyy년 M월 d일 (eee)', { locale: ko })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400">시간</span>
            <span className="ml-auto text-white font-medium">
              {formatSlotTime(selectedSlot)} ~ {formatSlotTime(selectedSlotEnd)}
            </span>
          </div>
        </div>
        <button
          onClick={handleGoToSchedule}
          className="w-full max-w-sm inline-flex items-center justify-center rounded-xl font-medium text-base px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_8px_32px_rgba(16,185,129,0.3)] transition-all duration-200"
        >
          내 스케줄 보기
        </button>
      </div>
    )
  }

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
                  idx < 2
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                    : 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]',
                )}
              >
                {idx + 1}
              </div>
              <span
                className={`text-xs font-medium ${idx === 2 ? 'text-emerald-400' : 'text-slate-500'}`}
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

      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-bold text-white">신청 내용 확인</h1>
        <p className="text-sm text-slate-400 mt-1">아래 내용으로 PT를 신청합니다</p>
      </div>

      {/* 요약 카드 */}
      <div className="bg-white/[0.08] backdrop-blur-[15px] border border-white/[0.12] rounded-2xl p-5 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        {/* 트레이너 */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/[0.08] border border-white/[0.12]">
            {profile_image_url ? (
              <Image
                src={profile_image_url}
                alt={profiles.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-emerald-400">
                  {profiles.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">트레이너</p>
            <p className="text-base font-semibold text-white">{profiles.name}</p>
            <p className="text-xs text-slate-400">경력 {career_years ?? 0}년</p>
          </div>
        </div>

        {/* 날짜 / 시간 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">날짜</p>
              <p className="text-sm font-medium text-white">
                {format(selectedDate, 'yyyy년 M월 d일 (eee)', { locale: ko })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">시간</p>
              <p className="text-sm font-medium text-white">
                {formatSlotTime(selectedSlot)} ~ {formatSlotTime(selectedSlotEnd)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {status === 'error' && errorMessage && (
        <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{errorMessage}</p>
        </div>
      )}

      {/* 안내 문구 */}
      <p className="text-xs text-slate-500 text-center">
        신청 후 트레이너가 승인하면 예약이 확정됩니다.
      </p>

      {/* 하단 sticky 신청하기 버튼 */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center px-4 z-10">
        <button
          disabled={status === 'loading'}
          onClick={handleSubmit}
          className={cn(
            'w-full max-w-sm inline-flex items-center justify-center gap-2',
            'rounded-xl font-medium text-base px-6 py-3 transition-all duration-200',
            status === 'loading'
              ? 'bg-white/[0.08] text-slate-500 cursor-not-allowed border border-white/[0.12]'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_8px_32px_rgba(16,185,129,0.3)]',
          )}
        >
          {status === 'loading' && (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          {status === 'loading' ? '신청 중...' : 'PT 신청하기'}
        </button>
      </div>
    </div>
  )
}
