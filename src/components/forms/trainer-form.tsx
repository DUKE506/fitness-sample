'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createTrainer, updateTrainer } from '@/actions/trainers'
import type { TrainerWithProfile } from '@/lib/types'

interface TrainerFormProps {
  /** 수정 모드일 때 기존 데이터 */
  trainer?: TrainerWithProfile
  /** 저장 성공 후 이동할 경로 (기본값: '/admin/trainers') */
  redirectTo?: string
}

export function TrainerForm({ trainer, redirectTo }: TrainerFormProps) {
  const isEdit = !!trainer
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // 배열 필드 상태
  const [specialties, setSpecialties] = useState<string[]>(trainer?.specialties ?? [])
  const [certifications, setCertifications] = useState<string[]>(trainer?.certifications ?? [])
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [certInput, setCertInput] = useState('')

  function addTag(value: string, list: string[], setList: (v: string[]) => void, setInput: (v: string) => void) {
    const trimmed = value.trim()
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed])
    }
    setInput('')
  }

  function removeTag(index: number, list: string[], setList: (v: string[]) => void) {
    setList(list.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      let result

      if (isEdit) {
        result = await updateTrainer(trainer.id, {
          name: fd.get('name') as string,
          phone: fd.get('phone') as string || undefined,
          bio: fd.get('bio') as string || undefined,
          specialties,
          certifications,
          career_years: Number(fd.get('career_years')),
          hourly_rate: Number(fd.get('hourly_rate')),
        })
      } else {
        result = await createTrainer({
          email: fd.get('email') as string,
          password: fd.get('password') as string,
          name: fd.get('name') as string,
          phone: fd.get('phone') as string || undefined,
          bio: fd.get('bio') as string || undefined,
          specialties,
          certifications,
          career_years: Number(fd.get('career_years')),
          hourly_rate: Number(fd.get('hourly_rate')),
        })
      }

      if (!result.success) {
        setError(result.error)
      } else {
        router.push(redirectTo ?? '/admin/trainers')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* 계정 정보 (등록 모드만) */}
      {!isEdit && (
        <section className="rounded-2xl border border-white/12 bg-white/4 p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">계정 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="email" type="email" label="이메일" placeholder="trainer@fitcenter.com" required />
            <Input name="password" type="password" label="비밀번호" placeholder="8자 이상" required />
          </div>
        </section>
      )}

      {/* 기본 정보 */}
      <section className="rounded-2xl border border-white/12 bg-white/4 p-6 space-y-4">
        <h2 className="text-base font-semibold text-white">기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="name"
            label="이름"
            placeholder="홍길동"
            defaultValue={trainer?.profiles.name}
            required
          />
          <Input
            name="phone"
            type="tel"
            label="연락처"
            placeholder="010-0000-0000"
            defaultValue={trainer?.profiles.phone ?? ''}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300 block mb-1.5">소개글</label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={trainer?.bio ?? ''}
            placeholder="트레이너 소개를 입력하세요"
            className="w-full bg-white/6 border border-white/12 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors resize-none"
          />
        </div>
      </section>

      {/* 전문 정보 */}
      <section className="rounded-2xl border border-white/12 bg-white/4 p-6 space-y-4">
        <h2 className="text-base font-semibold text-white">전문 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="career_years"
            type="number"
            label="경력 (년)"
            placeholder="0"
            min={0}
            max={50}
            defaultValue={trainer?.career_years ?? 0}
          />
          <Input
            name="hourly_rate"
            type="number"
            label="시간당 요금 (원)"
            placeholder="0"
            min={0}
            defaultValue={trainer?.hourly_rate ?? 0}
          />
        </div>

        {/* 전문분야 태그 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 block">전문분야</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {specialties.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {s}
                <button type="button" onClick={() => removeTag(i, specialties, setSpecialties)} className="cursor-pointer hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={specialtyInput}
              onChange={(e) => setSpecialtyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag(specialtyInput, specialties, setSpecialties, setSpecialtyInput)
                }
              }}
              placeholder="전문분야 입력 후 Enter"
              className="flex-1 bg-white/6 border border-white/12 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => addTag(specialtyInput, specialties, setSpecialties, setSpecialtyInput)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 자격증 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 block">자격증</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {certifications.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-white/8 text-slate-300 border border-white/12">
                {c}
                <button type="button" onClick={() => removeTag(i, certifications, setCertifications)} className="cursor-pointer hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag(certInput, certifications, setCertifications, setCertInput)
                }
              }}
              placeholder="자격증 입력 후 Enter"
              className="flex-1 bg-white/6 border border-white/12 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => addTag(certInput, certifications, setCertifications, setCertInput)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* 버튼 */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isEdit ? '수정 완료' : '트레이너 등록'}
        </Button>
      </div>
    </form>
  )
}
