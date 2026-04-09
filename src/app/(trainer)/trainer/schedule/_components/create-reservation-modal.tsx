'use client'

import { useState, useTransition, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { createReservation } from '@/actions/reservations'
import { useAvailableSlots } from '@/hooks/use-available-slots'
import type { MemberWithProfile } from '@/lib/types'

interface PtPackageOption {
  id: string
  label: string
  remaining: number
}

interface CreateReservationModalProps {
  trainerId: string
  members: MemberWithProfile[]
  onSuccess: () => void
}

export function CreateReservationModal({
  trainerId,
  members,
  onSuccess,
}: CreateReservationModalProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [memberId, setMemberId] = useState('')
  const [packageId, setPackageId] = useState('')
  const [packages, setPackages] = useState<PtPackageOption[]>([])
  const [packagesLoading, setPackagesLoading] = useState(false)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const { slots, loading: slotsLoading } = useAvailableSlots(trainerId, date || null)

  // 회원 선택 시 해당 회원의 활성 PT 패키지 조회
  useEffect(() => {
    if (!memberId) {
      setPackages([])
      setPackageId('')
      return
    }

    setPackagesLoading(true)
    setPackageId('')
    const supabase = createClient()
    supabase
      .from('pt_packages')
      .select('id, total_sessions, remaining_sessions, start_date')
      .eq('member_id', memberId)
      .eq('trainer_id', trainerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const opts: PtPackageOption[] = (data ?? []).map((p) => ({
          id: p.id,
          label: `${p.start_date} 등록 · 잔여 ${p.remaining_sessions}/${p.total_sessions}회`,
          remaining: p.remaining_sessions,
        }))
        setPackages(opts)
        setPackagesLoading(false)
      })
  }, [memberId, trainerId])

  function handleOpen() {
    setOpen(true)
    setError(null)
    setMemberId('')
    setPackageId('')
    setPackages([])
    setDate('')
    setStartTime('')
    setEndTime('')
  }

  function handleSlotSelect(slot: { start_time: string; end_time: string }) {
    setStartTime(slot.start_time.slice(0, 5))
    setEndTime(slot.end_time.slice(0, 5))
  }

  function handleSubmit() {
    if (!memberId) { setError('회원을 선택해주세요.'); return }
    if (!date) { setError('날짜를 입력해주세요.'); return }
    if (!startTime) { setError('시작 시간을 입력해주세요.'); return }
    if (!endTime) { setError('종료 시간을 입력해주세요.'); return }
    if (endTime <= startTime) { setError('종료 시간은 시작 시간보다 늦어야 합니다.'); return }

    setError(null)
    startTransition(async () => {
      const result = await createReservation(
        memberId,
        trainerId,
        packageId || null,
        date,
        `${startTime}:00`,
        `${endTime}:00`,
      )
      if (result.success) {
        setOpen(false)
        onSuccess()
      } else {
        setError(result.error)
      }
    })
  }

  const memberOptions = members
    .filter((m) => m.profiles != null)
    .map((m) => ({
      value: m.id,
      label: m.profiles.name,
    }))

  const packageOptions = packages.map((p) => ({
    value: p.id,
    label: p.label,
    disabled: p.remaining === 0,
  }))

  return (
    <>
      <Button variant="primary" size="sm" onClick={handleOpen}>
        <Plus className="w-4 h-4" />
        예약 생성
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="예약 생성">
        <div className="space-y-4">
          {/* 회원 선택 */}
          <Select
            label="회원"
            placeholder="담당 회원 선택"
            options={memberOptions}
            value={memberId}
            onChange={setMemberId}
          />

          {/* PT 패키지 선택 */}
          <Select
            label="PT 패키지 (선택)"
            placeholder={
              !memberId
                ? '회원을 먼저 선택하세요'
                : packagesLoading
                  ? '불러오는 중...'
                  : packages.length === 0
                    ? '활성 패키지 없음'
                    : '패키지 선택 (선택사항)'
            }
            options={packageOptions}
            value={packageId}
            onChange={setPackageId}
            disabled={!memberId || packagesLoading || packages.length === 0}
          />

          {/* 날짜 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setStartTime(''); setEndTime('') }}
              className={cn(
                'w-full bg-white/6 border border-white/12 rounded-xl',
                'px-4 py-2.5 text-white text-sm',
                'focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30',
                'transition-colors duration-200',
                '[color-scheme:dark]',
              )}
            />
          </div>

          {/* 시간 슬롯 */}
          {date && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">시간 선택</label>
                {startTime && (
                  <span className="text-xs text-emerald-400">
                    {startTime} – {endTime}
                  </span>
                )}
              </div>
              {slotsLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-slate-500 py-3 text-center">
                  해당 날짜에 가능한 시간이 없습니다.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {slots.map((slot) => {
                    const s = slot.start_time.slice(0, 5)
                    const e = slot.end_time.slice(0, 5)
                    const selected = startTime === s && endTime === e
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSlotSelect(slot)}
                        className={cn(
                          'px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-150 cursor-pointer',
                          selected
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/6 border border-white/12 text-slate-300 hover:bg-white/10 hover:text-white',
                        )}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
            취소
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isPending}>
            예약 생성
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}
