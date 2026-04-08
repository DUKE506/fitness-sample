import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TrainerReservationsClient } from './_components/trainer-reservations-client'
import type { TrainerWithProfile } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('trainers')
    .select('profiles(name)')
    .eq('id', id)
    .single()

  const name = (data?.profiles as { name: string } | null)?.name ?? '트레이너'
  return { title: `${name} — 예약 관리` }
}

export default async function TrainerReservationsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('trainers')
    .select('*, profiles(*)')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const trainer = data as TrainerWithProfile

  return (
    <div className="min-h-full">
      <div className="px-6 lg:px-8 pt-6">
        <Link
          href={`/admin/trainers/${id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          트레이너 상세
        </Link>
      </div>
      <TrainerReservationsClient trainer={trainer} />
    </div>
  )
}
