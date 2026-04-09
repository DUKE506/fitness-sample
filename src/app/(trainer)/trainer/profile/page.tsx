import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TrainerForm } from '@/components/forms/trainer-form'
import type { TrainerWithProfile } from '@/lib/types'

export default async function TrainerProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: trainer, error } = await supabase
    .from('trainers')
    .select('*, profiles(*)')
    .eq('profile_id', user.id)
    .single()

  if (error || !trainer) redirect('/login')

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-white">내 프로필</h1>
      <TrainerForm
        trainer={trainer as TrainerWithProfile}
        redirectTo="/trainer/profile"
      />
    </div>
  )
}
