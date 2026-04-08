import { createAdminClient } from '@/lib/supabase/admin'
import { TrainerSelectList } from './_components/trainer-select-list'
import type { TrainerWithProfile } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ trainer?: string }>
}

const STEPS = ['트레이너 선택', '일정 선택', '신청 완료']

export default async function ApplyPage({ searchParams }: PageProps) {
  const { trainer: preselectedId } = await searchParams
  const supabase = createAdminClient()

  const { data: trainers } = await supabase
    .from('trainers')
    .select('*, profiles(*)')
    .eq('is_active', true)
    .order('career_years', { ascending: false })

  const allTrainers = (trainers ?? []) as TrainerWithProfile[]

  return (
    <div className="px-4 py-6 pb-24 space-y-6">
      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={
                  idx === 0
                    ? 'w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : 'w-7 h-7 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-xs font-medium text-slate-500'
                }
              >
                {idx + 1}
              </div>
              <span className={`text-xs font-medium ${idx === 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {step}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-white/[0.08] mx-2 mb-4" />
            )}
          </div>
        ))}
      </div>

      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-bold text-white">트레이너 선택</h1>
        <p className="text-sm text-slate-400 mt-1">PT를 진행할 트레이너를 선택하세요</p>
      </div>

      {/* 트레이너 목록 */}
      <TrainerSelectList trainers={allTrainers} preselectedId={preselectedId ?? null} />
    </div>
  )
}
