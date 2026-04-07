'use client'

import { useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { signInWithPassword } from '@/actions/auth'

export function AdminLoginForm() {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => signInWithPassword(formData))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="email"
        type="email"
        label="이메일"
        placeholder="admin@fitcenter.com"
        required
        autoComplete="email"
      />
      <Input
        name="password"
        type="password"
        label="비밀번호"
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />
      <Button type="submit" className="w-full" isLoading={isPending}>
        로그인
      </Button>
    </form>
  )
}
