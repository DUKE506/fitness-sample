import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { TrainerForm } from '@/components/forms/trainer-form'

export const metadata: Metadata = {
  title: '트레이너 등록',
}

export default function NewTrainerPage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          href="/admin/trainers"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          트레이너 목록
        </Link>
        <h1 className="text-3xl font-bold text-white">트레이너 등록</h1>
      </div>

      <TrainerForm />
    </div>
  )
}
