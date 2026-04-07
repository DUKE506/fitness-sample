'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateMemberSchema } from '@/lib/validations/member'
import type { UpdateMemberInput } from '@/lib/validations/member'

type ActionResult = { success: true } | { success: false; error: string }

export async function updateMember(memberId: string, input: UpdateMemberInput): Promise<ActionResult> {
  const parsed = updateMemberSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('members')
    .update(parsed.data)
    .eq('id', memberId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${memberId}`)
  return { success: true }
}
