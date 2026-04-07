import type { Tables } from './database'
import type { Role, ReservationStatus, MemberType, PaymentMethod } from '@/lib/constants'

// ─── Row 타입 (DB 원본) ───────────────────────────────────────────────────────

export type Profile = Tables<'profiles'>
export type Trainer = Tables<'trainers'>
export type Member = Tables<'members'>
export type PtPackage = Tables<'pt_packages'>
export type Reservation = Tables<'reservations'>
export type Payment = Tables<'payments'>
export type TrainerSchedule = Tables<'trainer_schedules'>
export type TrainerDayOff = Tables<'trainer_day_offs'>

// ─── 조인 타입 (UI에서 자주 쓰는 조합) ────────────────────────────────────────

export type TrainerWithProfile = Trainer & {
  profiles: Profile
}

export type MemberWithProfile = Member & {
  profiles: Profile
  trainers: Trainer | null
}

export type ReservationWithDetails = Reservation & {
  members: Member & { profiles: Profile }
  trainers: Trainer & { profiles: Profile }
  pt_packages: PtPackage | null
}

export type PtPackageWithTrainer = PtPackage & {
  trainers: Trainer & { profiles: Profile }
}

// ─── 인증 유저 타입 ────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string
  email: string | null
  role: Role
  name: string
  avatarUrl: string | null
}

// ─── 리터럴 타입 재export ──────────────────────────────────────────────────────

export type { Role, ReservationStatus, MemberType, PaymentMethod }

// ─── RPC 반환 타입 ─────────────────────────────────────────────────────────────

export type AvailableSlot = {
  start_time: string
  end_time: string
}

export type MonthlyRevenue = {
  total_amount: number
  payment_count: number
}
