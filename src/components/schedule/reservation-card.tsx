'use client'

import { useState, useTransition } from 'react'
import { Clock, User, Dumbbell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils/cn'
import { RESERVATION_STATUS_LABEL } from '@/lib/constants'
import { cancelReservation } from '@/actions/reservations'
import type { ReservationWithDetails } from '@/lib/types'
import type { ReservationStatus } from '@/lib/constants'

interface ReservationCardProps {
  reservation: ReservationWithDetails
  viewAs?: 'admin' | 'trainer' | 'member'
  showActions?: boolean
  onStatusChange?: () => void
  className?: string
}

function ReservationCard({
  reservation,
  viewAs = 'admin',
  showActions = false,
  onStatusChange,
  className,
}: ReservationCardProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)

  const { reservation_date, start_time, end_time, status } = reservation
  const memberName = reservation.members.profiles.name
  const trainerName = reservation.trainers.profiles.name

  // "HH:mm:ss" → "HH:mm"
  const fmt = (t: string) => t.slice(0, 5)

  function handleAction(
    action: (id: string) => Promise<{ success: boolean; error?: string }>,
  ) {
    setActionError(null)
    startTransition(async () => {
      const result = await action(reservation.id)
      if (result.success) {
        setOpen(false)
        onStatusChange?.()
      } else {
        setActionError(result.error ?? '오류가 발생했습니다.')
      }
    })
  }

  const canCancel =
    showActions && (viewAs === 'admin' || viewAs === 'trainer') && status === 'confirmed'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'w-full text-left',
          'bg-white/8 hover:bg-white/13 transition-colors duration-200',
          'border border-white/12 rounded-2xl p-4',
          'cursor-pointer',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            {/* 날짜 + 시간 */}
            <div className="flex items-center gap-1.5 text-sm text-slate-300">
              <Clock className="w-4 h-4 shrink-0 text-slate-400" />
              <span>{reservation_date}</span>
              <span className="text-slate-500">·</span>
              <span>
                {fmt(start_time)} – {fmt(end_time)}
              </span>
            </div>

            {/* 회원명 / 트레이너명 */}
            <div className="flex items-center gap-3">
              {viewAs !== 'member' && (
                <div className="flex items-center gap-1.5 text-sm text-white font-medium">
                  <User className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>{memberName}</span>
                </div>
              )}
              {viewAs !== 'trainer' && (
                <div className="flex items-center gap-1.5 text-sm text-slate-300">
                  <Dumbbell className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>{trainerName}</span>
                </div>
              )}
            </div>
          </div>

          <Badge variant={status as ReservationStatus}>
            {RESERVATION_STATUS_LABEL[status as ReservationStatus]}
          </Badge>
        </div>
      </button>

      {/* 상세 모달 */}
      <Dialog open={open} onClose={() => setOpen(false)} title="예약 상세">
        <div className="space-y-4">
          {/* 기본 정보 */}
          <dl className="space-y-2 text-sm">
            <Row label="날짜" value={reservation_date} />
            <Row label="시간" value={`${fmt(start_time)} – ${fmt(end_time)}`} />
            <Row label="회원" value={memberName} />
            <Row label="트레이너" value={trainerName} />
            <Row
              label="상태"
              value={
                <Badge variant={status as ReservationStatus}>
                  {RESERVATION_STATUS_LABEL[status as ReservationStatus]}
                </Badge>
              }
            />
          </dl>

          {actionError && (
            <p className="text-sm text-red-400">{actionError}</p>
          )}
        </div>

        {canCancel && (
          <DialogFooter>
            <Button
              variant="danger"
              size="sm"
              disabled={isPending}
              onClick={() => handleAction(cancelReservation)}
            >
              예약 취소
            </Button>
          </DialogFooter>
        )}
      </Dialog>
    </>
  )
}

function Row({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <dt className="w-20 shrink-0 text-slate-400">{label}</dt>
      <dd className="text-slate-200">{value}</dd>
    </div>
  )
}

export { ReservationCard }
