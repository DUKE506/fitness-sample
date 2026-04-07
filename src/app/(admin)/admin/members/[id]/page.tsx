import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, User, Phone, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { MemberInfoForm } from './_components/member-info-form'
import type { MemberWithProfile, TrainerWithProfile } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('members')
    .select('profiles(name)')
    .eq('id', id)
    .single()

  const name = (data?.profiles as { name: string } | null)?.name ?? '회원'
  return { title: `${name} — 회원 상세` }
}

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [memberRes, trainersRes] = await Promise.all([
    supabase
      .from('members')
      .select('*, profiles(*), trainers:assigned_trainer_id(*, profiles(*))')
      .eq('id', id)
      .single(),
    supabase
      .from('trainers')
      .select('*, profiles(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
  ])

  if (memberRes.error || !memberRes.data) {
    notFound()
  }

  const member = memberRes.data as MemberWithProfile
  const trainers = (trainersRes.data ?? []) as TrainerWithProfile[]

  const trainerOptions = trainers.map((t) => ({
    id: t.id,
    name: t.profiles.name,
  }))

  return (
    <div className="p-6 lg:p-8 w-full lg:max-w-3xl">
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          회원 목록
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">{member.profiles.name}</h1>
          <Badge variant={member.member_type === 'pt' ? 'primary' : 'default'}>
            {member.member_type === 'pt' ? 'PT' : '일반'}
          </Badge>
          <Badge variant={member.is_active ? 'success' : 'muted'}>
            {member.is_active ? '활성' : '비활성'}
          </Badge>
        </div>
      </div>

      {/* 기본정보 카드 */}
      <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] p-6 mb-6">
        <h2 className="text-base font-semibold text-white mb-4">기본 정보</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <dt className="text-xs text-slate-500 mb-0.5">이름</dt>
              <dd className="text-sm text-white">{member.profiles.name}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <dt className="text-xs text-slate-500 mb-0.5">연락처</dt>
              <dd className="text-sm text-white">{member.profiles.phone ?? '-'}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <dt className="text-xs text-slate-500 mb-0.5">가입일</dt>
              <dd className="text-sm text-white">
                {member.join_date ? member.join_date : (member.created_at ? member.created_at.slice(0, 10) : '-')}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 shrink-0" />
            <div>
              <dt className="text-xs text-slate-500 mb-0.5">담당 트레이너</dt>
              <dd className="text-sm text-white">
                {member.trainers ? (member.trainers as TrainerWithProfile).profiles.name : '-'}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      {/* 회원 정보 수정 */}
      <MemberInfoForm
        memberId={member.id}
        memberType={member.member_type}
        assignedTrainerId={member.assigned_trainer_id}
        trainers={trainerOptions}
      />
    </div>
  )
}
