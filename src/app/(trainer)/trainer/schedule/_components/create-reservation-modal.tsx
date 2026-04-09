'use client'

import { useState, useTransition, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { createReservation } from '@/actions/reservations'
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
              onChange={(e) => setDate(e.target.value)}
              className={cn(
                'w-full bg-white/6 border border-white/12 rounded-xl',
                'px-4 py-2.5 text-white text-sm',
                'focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30',
                'transition-colors duration-200',
                '[color-scheme:dark]',
              )}
            />
          </div>

          {/* 시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">시작 시간</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={cn(
                  'w-full bg-white/6 border border-white/12 rounded-xl',
                  'px-4 py-2.5 text-white text-sm',
                  'focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30',
                  'transition-colors duration-200',
                  '[color-scheme:dark]',
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">종료 시간</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={cn(
                  'w-full bg-white/6 border border-white/12 rounded-xl',
                  'px-4 py-2.5 text-white text-sm',
                  'focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30',
                  'transition-colors duration-200',
                  '[color-scheme:dark]',
                )}
              />
            </div>
          </div>

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
