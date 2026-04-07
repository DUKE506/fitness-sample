'use client'

import { useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { signUpForDev } from '@/actions/auth'

export function DevSignUpForm() {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => signUpForDev(formData))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-slate-500 mb-3">개발 테스트용 일반 회원 계정 생성</p>
      <Input
        name="name"
        label="이름"
        placeholder="홍길동"
        required
      />
      <Input
        name="email"
        type="email"
        label="이메일"
        placeholder="test@example.com"
        required
      />
      <Input
        name="password"
        type="password"
        label="비밀번호"
        placeholder="6자 이상"
        required
        minLength={6}
      />
      <Button type="submit" variant="secondary" className="w-full" isLoading={isPending}>
        임시 회원가입
      </Button>
    </form>
  )
}
