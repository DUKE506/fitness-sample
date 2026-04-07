'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createPtPackageSchema } from '@/lib/validations/member'
import type { CreatePtPackageInput } from '@/lib/validations/member'

type ActionResult = { success: true } | { success: false; error: string }

export async function createPtPackage(input: CreatePtPackageInput): Promise<ActionResult> {
  const parsed = createPtPackageSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { member_id, trainer_id, total_sessions, price, start_date, end_date, payment_method } =
    parsed.data
  const supabase = await createClient()

  // pt_packages 생성
  const { data: pkg, error: pkgError } = await supabase
    .from('pt_packages')
    .insert({
      member_id,
      trainer_id,
      total_sessions,
      remaining_sessions: total_sessions,
      price,
      start_date,
      end_date: end_date ?? null,
      status: 'active',
    })
    .select('id')
    .single()

  if (pkgError || !pkg) {
    return { success: false, error: pkgError?.message ?? 'PT 패키지 등록 실패' }
  }

  // payments 생성
  const { error: paymentError } = await supabase.from('payments').insert({
    member_id,
    pt_package_id: pkg.id,
    amount: price,
    payment_method,
    status: 'completed',
  })

  if (paymentError) {
    return { success: false, error: paymentError.message }
  }

  revalidatePath(`/admin/members/${member_id}`)
  return { success: true }
}
