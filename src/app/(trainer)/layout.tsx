import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TrainerTabBar } from '@/components/layout/trainer-tab-bar'

export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'trainer') redirect('/login')

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 min-h-0 overflow-y-auto pb-24">{children}</main>
      <TrainerTabBar />
    </div>
  )
}
