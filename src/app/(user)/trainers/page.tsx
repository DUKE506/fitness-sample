import { createAdminClient } from '@/lib/supabase/admin'
import { TrainerCard } from '@/components/trainer/trainer-card'
import { SpecialtyFilter } from './_components/specialty-filter'
import type { TrainerWithProfile } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ specialty?: string }>
}

export default async function TrainersPage({ searchParams }: PageProps) {
  const { specialty } = await searchParams
  // profiles RLS가 본인만 조회 허용이라 join 시 null 반환 → admin 클라이언트로 우회
  const supabase = createAdminClient()

  const { data: trainers } = await supabase
    .from('trainers')
    .select('*, profiles(*)')
    .eq('is_active', true)
    .order('career_years', { ascending: false })

  const allTrainers = (trainers ?? []) as TrainerWithProfile[]

  // 전문분야 목록 수집 (중복 제거, 정렬)
  const allSpecialties = Array.from(
    new Set(allTrainers.flatMap((t) => t.specialties))
  ).sort()

  // 필터 적용
  const filtered = specialty
    ? allTrainers.filter((t) => t.specialties.includes(specialty))
    : allTrainers

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">트레이너</h1>
        <p className="text-sm text-slate-400 mt-1">나에게 맞는 트레이너를 찾아보세요</p>
      </div>

      {/* 전문분야 필터 */}
      {allSpecialties.length > 0 && (
        <SpecialtyFilter specialties={allSpecialties} current={specialty ?? null} />
      )}

      {/* 카드 그리드 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <p className="text-sm">해당 전문분야의 트레이너가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
      )}
    </div>
  )
}
