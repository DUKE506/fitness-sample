'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, Clock, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils/cn'
import { completeReservation } from '@/actions/reservations'
import type { ReservationWithDetails } from '@/lib/types'

interface TodaySessionsProps {
  reservations: ReservationWithDetails[]
  onStatusChange: () => void
}

export function TodaySessions({ reservations, onStatusChange }: TodaySessionsProps) {
  if (reservations.length === 0) {
    return (
      <div className="bg-white/4 border border-white/10 rounded-2xl p-5">
        <SectionHeader count={0} />
        <p className="mt-4 text-center text-sm text-slate-500 py-4">
          오늘 예정된 PT가 없습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/4 border border-white/10 rounded-2xl p-5 space-y-3">
      <SectionHeader count={reservations.length} />
      <div className="space-y-2">
        {reservations.map((r) => (
          <SessionRow key={r.id} reservation={r} onStatusChange={onStatusChange} />
        ))}
      </div>
    </div>
  )
}

function SectionHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="w-4 h-4 text-emerald-400" />
      <h2 className="text-sm font-semibold text-white">오늘 PT</h2>
      {count > 0 && (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
          {count}건
        </span>
      )}
    </div>
  )
}

interface SessionRowProps {
  reservation: ReservationWithDetails
  onStatusChange: () => void
}

function SessionRow({ reservation, onStatusChange }: SessionRowProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const { start_time, end_time, status } = reservation
  const memberName = reservation.members?.profiles?.name ?? '알 수 없음'
  const fmt = (t: string) => t.slice(0, 5)

  function handleComplete() {
    setError(null)
    startTransition(async () => {
      const result = await completeReservation(reservation.id)
      if (result.success) {
        setOpen(false)
        onStatusChange()
      } else {
        setError(result.error ?? '오류가 발생했습니다.')
      }
    })
  }

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between gap-3',
          'bg-white/6 border border-white/10 rounded-xl px-4 py-3',
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 text-sm text-slate-300 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{fmt(start_time)} – {fmt(end_time)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-white font-medium truncate">
            <User className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{memberName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={status as 'confirmed'}>확정</Badge>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setOpen(true)}
          >
            완료
          </Button>
        </div>
      </div>

      {/* 완료 확인 모달 */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="PT 완료 처리"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            아래 세션을 완료 처리합니다. 잔여 세션이 1회 차감됩니다.
          </p>
          <dl className="space-y-2 text-sm">
            <Row label="회원" value={memberName} />
            <Row label="시간" value={`${fmt(start_time)} – ${fmt(end_time)}`} />
          </dl>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleComplete}
            disabled={isPending}
          >
            {isPending ? '처리 중…' : '완료 처리'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <dt className="w-16 shrink-0 text-slate-400">{label}</dt>
      <dd className="text-slate-200">{value}</dd>
    </div>
  )
}
