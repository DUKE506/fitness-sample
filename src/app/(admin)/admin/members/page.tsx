import type { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

export const metadata: Metadata = {
  title: '회원 관리',
}

type MemberRow = {
  id: string
  profile_id: string
  member_type: string
  assigned_trainer_id: string | null
  is_active: boolean
  join_date: string | null
  profiles: { name: string; phone: string | null }
  trainers: { profiles: { name: string } } | null
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; status?: string }>
}) {
  const { q, type, status } = await searchParams
  const supabase = await createClient()

  // Supabase는 embedded 테이블 컬럼 ilike 미지원 → 프로필 ID 선조회 후 in 필터
  let profileIds: string[] | null = null
  if (q?.trim()) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
    profileIds = data?.map((p) => p.id) ?? []
  }

  let list: MemberRow[] = []

  // 검색어 있는데 매칭 프로필 없으면 쿼리 스킵
  if (profileIds === null || profileIds.length > 0) {
    let query = supabase
      .from('members')
      .select('*, profiles(*), trainers:assigned_trainer_id(profiles(name))')
      .order('created_at', { ascending: false })

    if (profileIds) query = query.in('profile_id', profileIds)
    if (type === 'general' || type === 'pt') query = query.eq('member_type', type)
    if (status === 'active') query = query.eq('is_active', true)
    else if (status === 'inactive') query = query.eq('is_active', false)

    const { data } = await query
    list = (data ?? []) as MemberRow[]
  }

  const hasFilter = q || type || status

  return (
    <div className="p-6 lg:p-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">회원 관리</h1>
        <p className="mt-1 text-slate-400 text-sm">총 {list.length}명</p>
      </div>

      {/* 필터 폼 */}
      <form method="GET" className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="이름 또는 전화번호"
            className="pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-colors w-56"
          />
        </div>
        <Select
          name="type"
          defaultValue={type ?? ''}
          options={[
            { value: '', label: '전체 유형' },
            { value: 'general', label: '일반' },
            { value: 'pt', label: 'PT' },
          ]}
        />
        <Select
          name="status"
          defaultValue={status ?? ''}
          options={[
            { value: '', label: '전체 상태' },
            { value: 'active', label: '활성' },
            { value: 'inactive', label: '비활성' },
          ]}
        />
        <Button type="submit" variant="secondary" size="sm">
          검색
        </Button>
        {hasFilter && (
          <Link href="/admin/members">
            <Button type="button" variant="ghost" size="sm">
              초기화
            </Button>
          </Link>
        )}
      </form>

      {/* 테이블 */}
      <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="text-left px-6 py-4 text-slate-400 font-medium">이름</th>
              <th className="text-left px-6 py-4 text-slate-400 font-medium hidden sm:table-cell">연락처</th>
              <th className="text-left px-6 py-4 text-slate-400 font-medium">유형</th>
              <th className="text-left px-6 py-4 text-slate-400 font-medium hidden md:table-cell">담당 트레이너</th>
              <th className="text-left px-6 py-4 text-slate-400 font-medium">상태</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                  {hasFilter ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'}
                </td>
              </tr>
            ) : (
              list.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{member.profiles.name}</p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-slate-300">
                    {member.profiles.phone ?? '-'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={member.member_type === 'pt' ? 'primary' : 'default'}>
                      {member.member_type === 'pt' ? 'PT' : '일반'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-slate-300">
                    {member.trainers?.profiles.name ?? '-'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={member.is_active ? 'success' : 'muted'}>
                      {member.is_active ? '활성' : '비활성'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/members/${member.id}`}>
                      <Button variant="ghost" size="sm">상세</Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
