import { z } from 'zod'

export const createReservationSchema = z.object({
  member_id: z.string().uuid(),
  trainer_id: z.string().uuid(),
  pt_package_id: z.string().uuid(),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식이 올바르지 않습니다'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식이 올바르지 않습니다'),
})

export const cancelReservationSchema = z.object({
  reservation_id: z.string().uuid(),
  cancel_reason: z.string().max(200).optional(),
})

export const updateReservationStatusSchema = z.object({
  reservation_id: z.string().uuid(),
  status: z.enum(['confirmed', 'rejected']),
})

export type CreateReservationInput = z.infer<typeof createReservationSchema>
export type CancelReservationInput = z.infer<typeof cancelReservationSchema>
export type UpdateReservationStatusInput = z.infer<typeof updateReservationStatusSchema>
