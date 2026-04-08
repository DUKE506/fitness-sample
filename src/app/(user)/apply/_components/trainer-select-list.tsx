'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { useReservationStore } from '@/stores/use-reservation-store'
import { SpecialtyBadge } from '@/components/trainer/specialty-badge'
import { cn } from '@/lib/utils/cn'
import type { TrainerWithProfile } from '@/lib/types'

interface TrainerSelectListProps {
  trainers: TrainerWithProfile[]
  preselectedId: string | null
}

export function TrainerSelectList({ trainers, preselectedId }: TrainerSelectListProps) {
  const router = useRouter()
  const { selectedTrainer, setSelectedTrainer } = useReservationStore()

  // ?trainer=[id] 로 진입 시 자동 선택 후 다음 단계로
  useEffect(() => {
    if (!preselectedId) return
    const trainer = trainers.find((t) => t.id === preselectedId)
    if (trainer) {
      setSelectedTrainer(trainer)
      router.replace('/apply/time')
    }
  }, [preselectedId, trainers, setSelectedTrainer, router])

  function handleSelect(trainer: TrainerWithProfile) {
    setSelectedTrainer(trainer)
    router.push('/apply/time')
  }

  if (preselectedId) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {trainers.map((trainer) => {
        const isSelected = selectedTrainer?.id === trainer.id
        const { profiles, specialties, career_years, profile_image_url } = trainer
        const displaySpecialties = specialties.slice(0, 2)
        const extraCount = specialties.length - 2

        return (
          <button
            key={trainer.id}
            onClick={() => handleSelect(trainer)}
            className="w-full text-left group"
          >
            <div
              className={cn(
                'bg-white/[0.08] backdrop-blur-[15px] border rounded-2xl p-4',
                'shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-200',
                isSelected
                  ? 'border-emerald-500/60 bg-emerald-500/10'
                  : 'border-white/[0.12] group-hover:bg-white/[0.13] group-hover:border-white/20',
              )}
            >
              <div className="flex gap-4 items-center">
                {/* 프로필 이미지 */}
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white/[0.08] border border-white/[0.12]">
                  {profile_image_url ? (
                    <Image
                      src={profile_image_url}
                      alt={profiles.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xl font-bold text-emerald-400">
                        {profiles.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{profiles.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">경력 {career_years ?? 0}년</p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    {displaySpecialties.map((s) => (
                      <SpecialtyBadge key={s} specialty={s} />
                    ))}
                    {extraCount > 0 && (
                      <span className="text-xs text-slate-400">+{extraCount}</span>
                    )}
                    {specialties.length === 0 && (
                      <span className="text-xs text-slate-600">전문분야 미등록</span>
                    )}
                  </div>
                </div>

                {/* 선택 체크 */}
                {isSelected && (
                  <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>
          </button>
        )
      })}

      {trainers.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-12">등록된 트레이너가 없습니다.</p>
      )}
    </div>
  )
}
