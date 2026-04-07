'use client'

import { useState, useTransition } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toast'
import { createPtPackage } from '@/actions/payments'
import { PAYMENT_METHOD_LABEL } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils/format'
import type { BadgeVariant } from '@/components/ui/badge'

interface TrainerOption {
  id: string
  name: string
}

export interface PtPackageRow {
  id: string
  trainer_id: string
  total_sessions: number
  remaining_sessions: number
  price: number
  start_date: string
  end_date: string | null
  status: string
  created_at: string
  trainers: {
    profiles: { name: string }
  }
  payments: { payment_method: string }[]
}

interface Props {
  memberId: string
  packages: PtPackageRow[]
  trainers: TrainerOption[]
}

const STATUS_LABEL: Record<string, string> = {
  active: '진행중',
  completed: '완료',
  cancelled: '취소',
  expired: '만료',
}

const STATUS_BADGE_VARIANT: Record<string, BadgeVariant> = {
  active: 'success',
  completed: 'completed',
  cancelled: 'cancelled',
  expired: 'muted',
}

const PAYMENT_METHOD_OPTIONS = [
  { value: 'card', label: '카드' },
  { value: 'cash', label: '현금' },
  { value: 'transfer', label: '계좌이체' },
]

const initialForm = {
  trainer_id: '',
  total_sessions: '',
  price: '',
  payment_method: 'card',
  start_date: '',
  end_date: '',
}

export function PtPackageSection({ memberId, packages, trainers }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [isPending, startTransition] = useTransition()

  const activePackage = packages.find((p) => p.status === 'active')

  const trainerOptions = [
    { value: '', label: '트레이너 선택' },
    ...trainers.map((t) => ({ value: t.id, label: t.name })),
  ]

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleCancel() {
    setShowForm(false)
    setForm(initialForm)
  }

  function handleSubmit() {
    const totalSessions = parseInt(form.total_sessions, 10)
    const price = parseInt(form.price, 10)

    if (!form.trainer_id) return toast.error('트레이너를 선택해주세요.')
    if (!totalSessions || totalSessions < 1) return toast.error('세션 수를 입력해주세요.')
    if (isNaN(price) || price < 0) return toast.error('금액을 입력해주세요.')
    if (!form.start_date) return toast.error('시작일을 입력해주세요.')

    startTransition(async () => {
      const result = await createPtPackage({
        member_id: memberId,
        trainer_id: form.trainer_id,
        total_sessions: totalSessions,
        price,
        payment_method: form.payment_method as 'card' | 'cash' | 'transfer',
        start_date: form.start_date,
        end_date: form.end_date || undefined,
      })

      if (result.success) {
        toast.success('PT 패키지가 등록되었습니다.')
        handleCancel()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] p-6 mt-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-white">PT 패키지</h2>
        {!showForm && (
          <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            패키지 등록
          </Button>
        )}
      </div>

      {/* 현재 활성 패키지 */}
      <div className="mb-6">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">현재 패키지</p>
        {activePackage ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-white">
                  {activePackage.trainers.profiles.name} 트레이너
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  만료일: {activePackage.end_date ?? '없음'}
                </p>
              </div>
              <Badge variant="success">진행중</Badge>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>잔여 세션</span>
                <span className="text-white font-medium">
                  {activePackage.remaining_sessions} / {activePackage.total_sessions}회
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{
                    width: `${(activePackage.remaining_sessions / activePackage.total_sessions) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-6 text-center">등록된 패키지가 없습니다.</p>
        )}
      </div>

      {/* 패키지 등록 폼 */}
      {showForm && (
        <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-white">패키지 등록</p>
            <button
              onClick={handleCancel}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Select
                label="트레이너"
                value={form.trainer_id}
                onChange={(v) => handleChange('trainer_id', v)}
                options={trainerOptions}
              />
            </div>
            <Input
              label="세션 수"
              type="number"
              placeholder="예: 30"
              value={form.total_sessions}
              onChange={(e) => handleChange('total_sessions', e.target.value)}
              min={1}
            />
            <Input
              label="결제 금액 (원)"
              type="number"
              placeholder="예: 900000"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              min={0}
            />
            <Select
              label="결제 수단"
              value={form.payment_method}
              onChange={(v) => handleChange('payment_method', v)}
              options={PAYMENT_METHOD_OPTIONS}
            />
            <Input
              label="시작일"
              type="date"
              value={form.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
            />
            <div className="sm:col-span-2">
              <Input
                label="만료일 (선택)"
                type="date"
                value={form.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="primary" onClick={handleSubmit} isLoading={isPending}>
              등록
            </Button>
          </div>
        </div>
      )}

      {/* 패키지 이력 */}
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">이력</p>
        {packages.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">이력이 없습니다.</p>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {packages.map((pkg) => {
              const paymentMethod = pkg.payments[0]?.payment_method
              return (
                <div key={pkg.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">
                      {pkg.trainers.profiles.name} 트레이너
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {pkg.start_date}
                      {' · '}
                      {formatCurrency(pkg.price)}
                      {paymentMethod
                        ? ` · ${PAYMENT_METHOD_LABEL[paymentMethod as keyof typeof PAYMENT_METHOD_LABEL]}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400">
                      {pkg.remaining_sessions}/{pkg.total_sessions}회
                    </span>
                    <Badge variant={STATUS_BADGE_VARIANT[pkg.status] ?? 'default'}>
                      {STATUS_LABEL[pkg.status] ?? pkg.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
