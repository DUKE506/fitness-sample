'use client'

import { useState, useTransition } from 'react'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { updateMember } from '@/actions/members'

interface TrainerOption {
  id: string
  name: string
}

interface MemberInfoFormProps {
  memberId: string
  memberType: string
  assignedTrainerId: string | null
  trainers: TrainerOption[]
}

export function MemberInfoForm({ memberId, memberType, assignedTrainerId, trainers }: MemberInfoFormProps) {
  const [isPending, startTransition] = useTransition()
  const [type, setType] = useState(memberType)
  const [trainerId, setTrainerId] = useState(assignedTrainerId ?? '')

  const isPt = type === 'pt'

  function handleTypeChange(value: string) {
    setType(value)
    if (value === 'general') setTrainerId('')
  }

  const trainerOptions = [
    { value: '', label: '담당 트레이너 없음' },
    ...trainers.map((t) => ({ value: t.id, label: t.name })),
  ]

  function handleSave() {
    startTransition(async () => {
      const result = await updateMember(memberId, {
        member_type: type as 'general' | 'pt',
        assigned_trainer_id: trainerId === '' ? null : trainerId,
      })

      if (result.success) {
        toast.success('저장되었습니다.')
      } else {
        toast.error(result.error)
      }
    })
  }

  const isDirty = type !== memberType || (trainerId || '') !== (assignedTrainerId ?? '')

  return (
    <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] p-6">
      <h2 className="text-base font-semibold text-white mb-4">회원 정보 수정</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="회원 유형"
          value={type}
          onChange={handleTypeChange}
          options={[
            { value: 'general', label: '일반 회원' },
            { value: 'pt', label: 'PT 회원' },
          ]}
        />
        <Select
          label="담당 트레이너"
          value={trainerId}
          onChange={setTrainerId}
          options={trainerOptions}
          disabled={!isPt}
        />
      </div>
      <div className="mt-5 flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={isPending}
          disabled={!isDirty}
        >
          저장
        </Button>
      </div>
    </div>
  )
}
