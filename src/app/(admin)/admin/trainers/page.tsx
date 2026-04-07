import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { TrainerWithProfile } from '@/lib/types'

export const metadata: Metadata = {
  title: '트레이너 관리',
}

export default async function TrainersPage() {
  const supabase = await createClient()

  const { data: trainers } = await supabase
    .from('trainers')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false })

  const list = (trainers ?? []) as TrainerWithProfile[]

  return (
    <div className="p-6 lg:p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">트레이너 관리</h1>
          <p className="mt-1 text-slate-400 text-sm">총 {list.length}명</p>
        </div>
        <Link href="/admin/trainers/new">
          <Button>
            <Plus className="w-4 h-4" />
            트레이너 등록
          </Button>
        </Link>
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="이름으로 검색"
          disabled
          className="w-full max-w-xs pl-9 pr-4 py-2.5 rounded-xl bg-white/6 border border-white/12 text-sm text-white placeholder:text-slate-500 focus:outline-none cursor-not-allowed opacity-60"
        />
      </div>

      {/* 테이블 */}
      <div className="rounded-2xl border border-white/12 bg-white/4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left px-6 py-4 text-slate-400 font-medium">이름</th>
              <th className="text-left px-6 py-4 text-slate-400 font-medium hidden md:table-cell">전문분야</th>
              <th className="text-left px-6 py-4 text-slate-400 font-medium hidden lg:table-cell">경력</th>
              <th className="text-left px-6 py-4 text-slate-400 font-medium">상태</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                  등록된 트레이너가 없습니다.
                </td>
              </tr>
            ) : (
              list.map((trainer) => (
                <tr
                  key={trainer.id}
                  className="border-b border-white/6 last:border-0 hover:bg-white/3 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{trainer.profiles.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{trainer.profiles.phone ?? '-'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {trainer.specialties.slice(0, 2).map((s) => (
                        <Badge key={s} variant="default">{s}</Badge>
                      ))}
                      {trainer.specialties.length > 2 && (
                        <Badge variant="muted">+{trainer.specialties.length - 2}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-slate-300">
                    {trainer.career_years}년
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={trainer.is_active ? 'success' : 'muted'}>
                      {trainer.is_active ? '활성' : '비활성'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/trainers/${trainer.id}`}>
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
