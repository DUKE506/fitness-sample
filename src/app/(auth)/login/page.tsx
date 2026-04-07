import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { AdminLoginForm } from './_components/admin-login-form'
import { DevSignUpForm } from './_components/dev-signup-form'

export const metadata: Metadata = {
  title: '로그인',
}

interface Props {
  searchParams: Promise<{ error?: string; message?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { error, message } = await searchParams

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">FitCenter</h1>
        <p className="text-slate-400 text-sm mt-2">피트니스 센터 관리 시스템</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}
      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm">
          {decodeURIComponent(message)}
        </div>
      )}

      <Card>
        <h2 className="text-base font-semibold text-white mb-4">관리자 / 트레이너 로그인</h2>
        <AdminLoginForm />
      </Card>

      {/* 카카오 로그인 (추후 활성화) */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-transparent text-slate-500">회원</span>
        </div>
      </div>

      <button
        disabled
        className="w-full flex items-center justify-center gap-3 bg-[#FEE500]/20 border border-[#FEE500]/20 rounded-xl px-4 py-3 text-[#FEE500]/40 text-sm cursor-not-allowed"
      >
        <span className="font-bold text-base leading-none">K</span>
        카카오 로그인 (준비 중)
      </button>

      {/* 개발용 회원가입 */}
      <details className="group">
        <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-400 transition-colors text-center select-none">
          개발용 임시 회원가입
        </summary>
        <div className="mt-3">
          <Card>
            <DevSignUpForm />
          </Card>
        </div>
      </details>
    </div>
  )
}
