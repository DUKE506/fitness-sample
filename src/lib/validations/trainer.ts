import { z } from 'zod'

export const createTrainerSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력해주세요').max(50),
  phone: z.string().regex(/^01[0-9]-?\d{4}-?\d{4}$/, '올바른 전화번호를 입력해주세요').optional(),
  bio: z.string().max(500).optional(),
  specialties: z.array(z.string()).min(1, '전문분야를 1개 이상 입력해주세요'),
  certifications: z.array(z.string()).default([]),
  career_years: z.number().int().min(0).max(50).default(0),
  hourly_rate: z.number().int().min(0).default(0),
  profile_image_url: z.string().url().optional(),
})

export const updateTrainerSchema = createTrainerSchema
  .omit({ email: true, password: true })
  .partial()

export const trainerScheduleSchema = z.object({
  trainer_id: z.string().uuid(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식이 올바르지 않습니다'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식이 올바르지 않습니다'),
  slot_duration_minutes: z.number().int().min(30).max(120).default(60),
  is_active: z.boolean().default(true),
})

export const trainerDayOffSchema = z.object({
  trainer_id: z.string().uuid(),
  off_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다'),
  reason: z.string().max(200).optional(),
})

export type CreateTrainerInput = z.infer<typeof createTrainerSchema>
export type UpdateTrainerInput = z.infer<typeof updateTrainerSchema>
export type TrainerScheduleInput = z.infer<typeof trainerScheduleSchema>
export type TrainerDayOffInput = z.infer<typeof trainerDayOffSchema>
