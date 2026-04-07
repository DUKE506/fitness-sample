import Link from 'next/link'
import Image from 'next/image'

import { SpecialtyBadge } from './specialty-badge'
import { cn } from '@/lib/utils/cn'
import type { TrainerWithProfile } from '@/lib/types'

interface TrainerCardProps {
  trainer: TrainerWithProfile
}

export function TrainerCard({ trainer }: TrainerCardProps) {
  const { profiles, specialties, career_years, profile_image_url } = trainer

  if (!profiles) return null

  const MAX_BADGES = 2
  const displaySpecialties = specialties.slice(0, MAX_BADGES)
  const extraCount = specialties.length - MAX_BADGES

  return (
    <Link href={`/trainers/${trainer.id}`} className="block group">
      <div
        className={cn(
          'bg-white/8 backdrop-blur-[15px] border border-white/12 rounded-2xl p-4',
          'shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
          'transition-all duration-200',
          'group-hover:bg-white/13 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
          'group-hover:border-white/20'
        )}
      >
        <div className="flex gap-4 h-20">
          {/* 왼쪽: 프로필 이미지 */}
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-white/8 border border-white/12">
            {profile_image_url ? (
              <Image
                src={profile_image_url}
                alt={profiles.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">
                  {profiles.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* 오른쪽: 위=이름/경력, 아래=태그 */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            {/* 우상단: 이름 + 경력 */}
            <div>
              <p className="text-base font-semibold text-white truncate leading-tight">
                {profiles.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">경력 {career_years ?? 0}년</p>
            </div>

            {/* 우하단: 전문분야 태그 */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {displaySpecialties.map((s) => (
                <SpecialtyBadge key={s} specialty={s} />
              ))}
              {extraCount > 0 && (
                <span className="text-xs font-medium text-slate-400">
                  + {extraCount}
                </span>
              )}
              {specialties.length === 0 && (
                <span className="text-xs text-slate-600">전문분야 미등록</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
