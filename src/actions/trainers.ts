'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createTrainerSchema, updateTrainerSchema } from '@/lib/validations/trainer'
import type { CreateTrainerInput, UpdateTrainerInput } from '@/lib/validations/trainer'

type ActionResult = { success: true } | { success: false; error: string }

export async function createTrainer(input: CreateTrainerInput): Promise<ActionResult> {
  const parsed = createTrainerSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email, password, name, phone, bio, specialties, certifications, career_years, hourly_rate, profile_image_url } = parsed.data
  const admin = createAdminClient()

  // 1. auth 계정 생성
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  const userId = authData.user.id

  // 2. profiles role 업데이트 (trigger가 'member'로 생성)
  const { error: profileError } = await admin
    .from('profiles')
    .update({ role: 'trainer', phone: phone ?? null })
    .eq('id', userId)

  if (profileError) {
    return { success: false, error: profileError.message }
  }

  // 3. trainers 테이블 생성
  const { error: trainerError } = await admin
    .from('trainers')
    .insert({
      profile_id: userId,
      bio: bio ?? null,
      specialties,
      certifications,
      career_years,
      hourly_rate,
      profile_image_url: profile_image_url ?? null,
      is_active: true,
    })

  if (trainerError) {
    return { success: false, error: trainerError.message }
  }

  revalidatePath('/admin/trainers')
  return { success: true }
}

export async function updateTrainer(trainerId: string, input: UpdateTrainerInput): Promise<ActionResult> {
  const parsed = updateTrainerSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { name, phone, bio, specialties, certifications, career_years, hourly_rate, profile_image_url } = parsed.data

  // trainers 테이블 업데이트
  const { data: trainer, error: trainerError } = await supabase
    .from('trainers')
    .update({
      bio: bio ?? null,
      ...(specialties && { specialties }),
      ...(certifications && { certifications }),
      ...(career_years !== undefined && { career_years }),
      ...(hourly_rate !== undefined && { hourly_rate }),
      ...(profile_image_url !== undefined && { profile_image_url }),
    })
    .eq('id', trainerId)
    .select('profile_id')
    .single()

  if (trainerError) {
    return { success: false, error: trainerError.message }
  }

  // profiles 업데이트 (이름, 전화번호)
  if (name || phone !== undefined) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
      })
      .eq('id', trainer.profile_id)

    if (profileError) {
      return { success: false, error: profileError.message }
    }
  }

  revalidatePath('/admin/trainers')
  revalidatePath(`/admin/trainers/${trainerId}`)
  return { success: true }
}

export async function toggleTrainerActive(trainerId: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('trainers')
    .update({ is_active: isActive })
    .eq('id', trainerId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/trainers')
  revalidatePath(`/admin/trainers/${trainerId}`)
  return { success: true }
}
