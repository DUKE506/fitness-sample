import { z } from 'zod'

export const updateMemberSchema = z.object({
  member_type: z.enum(['general', 'pt']).optional(),
  assigned_trainer_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional(),
})

export const createPtPackageSchema = z.object({
  member_id: z.string().uuid(),
  trainer_id: z.string().uuid(),
  total_sessions: z.number().int().min(1, '세션 수는 1 이상이어야 합니다').max(200),
  price: z.number().int().min(0, '금액을 입력해주세요'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다').optional(),
  payment_method: z.enum(['card', 'cash', 'transfer']),
})

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
export type CreatePtPackageInput = z.infer<typeof createPtPackageSchema>
