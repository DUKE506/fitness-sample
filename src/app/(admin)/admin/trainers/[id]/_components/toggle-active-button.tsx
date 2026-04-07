'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toggleTrainerActive } from '@/actions/trainers'

interface ToggleActiveButtonProps {
  trainerId: string
  isActive: boolean
}

export function ToggleActiveButton({ trainerId, isActive }: ToggleActiveButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleToggle() {
    if (isActive) {
      const ok = window.confirm('이 트레이너를 비활성화하시겠습니까?\n비활성화된 트레이너는 회원에게 노출되지 않습니다.')
      if (!ok) return
    }

    setError(null)
    startTransition(async () => {
      const result = await toggleTrainerActive(trainerId, !isActive)
      if (!result.success) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-2">
      <Button
        variant={isActive ? 'danger' : 'outline'}
        onClick={handleToggle}
        isLoading={isPending}
      >
        {isActive ? '트레이너 비활성화' : '트레이너 활성화'}
      </Button>
      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}
    </div>
  )
}
