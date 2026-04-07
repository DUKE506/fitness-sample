import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ChevronLeft, Award, Dumbbell, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { createAdminClient } from '@/lib/supabase/admin'
import { SpecialtyBadge } from '@/components/trainer/specialty-badge'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/format'
import { addDays } from '@/lib/utils/date'
import type { TrainerWithProfile, AvailableSlot } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

function formatSlotTime(timeStr: string): string {
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour < 12 ? '오전' : '오후'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${ampm} ${displayHour}:${m}`
}

export default async function TrainerDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: trainerData } = await supabase
    .from('trainers')
    .select('*, profiles(*)')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!trainerData || !trainerData.profiles) notFound()

  const trainer = trainerData as TrainerWithProfile

  // 오늘부터 7일간 가용 슬롯 병렬 조회
  const today = new Date()
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(today, i))

  const slotResults = await Promise.all(
    weekDates.map(async (date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const { data } = await supabase.rpc('get_available_slots', {
        p_trainer_id: id,
        p_date: dateStr,
      })
      return { date, slots: (data ?? []) as AvailableSlot[] }
    })
  )

  const slotsWithData = slotResults.filter((r) => r.slots.length > 0)

  const { profiles, bio, specialties, career_years, certifications, hourly_rate } = trainer

  return (
    <div className="px-4 py-6 pb-44 space-y-4">
      {/* 뒤로가기 */}
      <Link
        href="/trainers"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors duration-200"
      >
        <ChevronLeft className="w-4 h-4" />
        트레이너 목록
      </Link>

      {/* 프로필 헤더 카드 */}
      <div className="bg-white/[0.08] backdrop-blur-[15px] border border-white/[0.12] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-white/[0.08] border border-white/[0.12]">
            {trainer.profile_image_url ? (
              <Image
                src={trainer.profile_image_url}
                alt={profiles.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl font-bold text-emerald-400">
                  {profiles.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white leading-tight">{profiles.name}</h1>
            <p className="text-sm text-slate-400 mt-0.5">경력 {career_years ?? 0}년</p>
            {hourly_rate != null && hourly_rate > 0 && (
              <p className="text-sm text-emerald-400 font-medium mt-1">
                {formatCurrency(hourly_rate)} / 시간
              </p>
            )}
          </div>
        </div>

        {bio && (
          <p className="mt-4 pt-4 text-sm text-slate-300 leading-relaxed border-t border-white/[0.08]">
            {bio}
          </p>
        )}
      </div>

      {/* 전문분야 */}
      {specialties.length > 0 && (
        <div className="bg-white/[0.08] backdrop-blur-[15px] border border-white/[0.12] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">전문분야</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {specialties.map((s) => (
              <SpecialtyBadge key={s} specialty={s} />
            ))}
          </div>
        </div>
      )}

      {/* 자격증 */}
      <div className="bg-white/[0.08] backdrop-blur-[15px] border border-white/[0.12] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">자격증</h2>
        </div>
        {certifications && certifications.length > 0 ? (
          <ul className="space-y-2">
            {certifications.map((cert, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-sm text-slate-300">{cert}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">등록된 자격증이 없습니다.</p>
        )}
      </div>

      {/* 이번 주 가능 시간대 */}
      <div className="bg-white/[0.08] backdrop-blur-[15px] border border-white/[0.12] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">이번 주 가능 시간대</h2>
        </div>
        {slotsWithData.length === 0 ? (
          <p className="text-sm text-slate-500">이번 주 가능한 시간대가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {slotsWithData.map(({ date, slots }) => {
              const dayLabel = format(date, 'M/d (eee)', { locale: ko })
              const preview = slots.slice(0, 3)
              const extra = slots.length - 3
              return (
                <div key={format(date, 'yyyy-MM-dd')} className="flex items-start gap-3">
                  <span className="text-xs text-slate-400 w-16 shrink-0 pt-0.5 font-medium">
                    {dayLabel}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.map((slot) => (
                      <span
                        key={slot.start_time}
                        className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      >
                        {formatSlotTime(slot.start_time)}
                      </span>
                    ))}
                    {extra > 0 && (
                      <span className="text-xs text-slate-500 pt-0.5">+{extra}개</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 하단 sticky CTA */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center px-4 z-10">
        <Link
          href={`/apply?trainer=${id}`}
          className={cn(
            'w-full max-w-sm inline-flex items-center justify-center',
            'rounded-xl border border-transparent font-medium text-base',
            'cursor-pointer transition-colors duration-200',
            'bg-emerald-500 hover:bg-emerald-600 text-white',
            'px-6 py-3',
            'shadow-[0_8px_32px_rgba(16,185,129,0.3)]'
          )}
        >
          PT 신청하기
        </Link>
      </div>
    </div>
  )
}
