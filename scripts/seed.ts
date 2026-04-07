/**
 * 개발용 mockup 데이터 시드 스크립트
 * 실행: npm run seed
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/lib/types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─── 시드 데이터 ──────────────────────────────────────────────────────────────

const TRAINERS = [
  {
    email: 'trainer1@fitcenter.com',
    password: 'trainer1234',
    name: '김민준',
    phone: '010-1234-5678',
    bio: '10년 경력의 웨이트 트레이닝 전문 트레이너입니다. 체형 교정과 근력 향상에 특화되어 있습니다.',
    specialties: ['웨이트트레이닝', '체형교정', '근력강화'],
    certifications: ['생활스포츠지도사 2급', 'NSCA-CPT'],
    career_years: 10,
    hourly_rate: 80000,
  },
  {
    email: 'trainer2@fitcenter.com',
    password: 'trainer1234',
    name: '이서연',
    phone: '010-2345-6789',
    bio: '필라테스와 요가를 접목한 유연성 중심 트레이닝을 제공합니다. 산전/산후 관리 경험 다수.',
    specialties: ['필라테스', '요가', '다이어트'],
    certifications: ['필라테스 지도자 1급', '산전산후 운동 전문가'],
    career_years: 6,
    hourly_rate: 70000,
  },
  {
    email: 'trainer3@fitcenter.com',
    password: 'trainer1234',
    name: '박도현',
    phone: '010-3456-7890',
    bio: '전 국가대표 수영선수 출신. 유산소 체력 향상과 수영 자세 교정 전문.',
    specialties: ['유산소', '수영', '재활운동'],
    certifications: ['수영 지도자 1급', 'ACSM-CPT'],
    career_years: 4,
    hourly_rate: 65000,
  },
]

const MEMBERS = [
  {
    email: 'member1@test.com',
    password: 'member1234',
    name: '홍길동',
    phone: '010-9876-5432',
    member_type: 'pt' as const,
  },
  {
    email: 'member2@test.com',
    password: 'member1234',
    name: '김지수',
    phone: '010-8765-4321',
    member_type: 'pt' as const,
  },
  {
    email: 'member3@test.com',
    password: 'member1234',
    name: '이태양',
    phone: '010-7654-3210',
    member_type: 'general' as const,
  },
]

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`  ${msg}`)
}

function ok(msg: string) {
  console.log(`  ✓ ${msg}`)
}

function fail(msg: string, err: unknown) {
  console.error(`  ✗ ${msg}:`, err)
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 시드 데이터 생성 시작\n')

  // 1. 트레이너 생성
  console.log('👟 트레이너 생성 중...')
  const trainerIds: string[] = []

  for (const t of TRAINERS) {
    log(`${t.name} (${t.email})`)

    // auth 계정 생성
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: t.email,
      password: t.password,
      email_confirm: true,
      user_metadata: { name: t.name },
    })

    if (authErr) {
      if (authErr.message.includes('already been registered')) {
        log(`  이미 존재함, 건너뜀`)
        // 기존 유저 ID 조회
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('name', t.name)
          .single()
        if (existing) trainerIds.push(existing.id)
        continue
      }
      fail('auth 생성 실패', authErr.message)
      continue
    }

    const userId = authData.user.id

    // profiles role 업데이트 (trigger가 'member'로 생성하므로 수정)
    await supabase.from('profiles').update({ role: 'trainer', phone: t.phone }).eq('id', userId)

    // trainers 테이블 생성
    const { data: trainerRow, error: trainerErr } = await supabase
      .from('trainers')
      .insert({
        profile_id: userId,
        bio: t.bio,
        specialties: t.specialties,
        certifications: t.certifications,
        career_years: t.career_years,
        hourly_rate: t.hourly_rate,
        is_active: true,
      })
      .select('id')
      .single()

    if (trainerErr) { fail('trainers 생성 실패', trainerErr.message); continue }

    trainerIds.push(trainerRow.id)

    // 트레이너 스케줄 생성 (월~금, 09:00~18:00)
    const schedules = [1, 2, 3, 4, 5].map((day) => ({
      trainer_id: trainerRow.id,
      day_of_week: day,
      start_time: '09:00',
      end_time: '18:00',
      slot_duration_minutes: 60,
      max_slots_per_hour: 1,
      is_active: true,
    }))

    await supabase.from('trainer_schedules').insert(schedules)

    ok(`${t.name} 완료 (trainer_id: ${trainerRow.id})`)
  }

  // 2. 회원 생성
  console.log('\n👤 회원 생성 중...')
  const memberIds: string[] = []

  for (let i = 0; i < MEMBERS.length; i++) {
    const m = MEMBERS[i]
    log(`${m.name} (${m.email})`)

    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: m.email,
      password: m.password,
      email_confirm: true,
      user_metadata: { name: m.name },
    })

    if (authErr) {
      if (authErr.message.includes('already been registered')) {
        log(`  이미 존재함, 건너뜀`)
        const { data: existing } = await supabase
          .from('members')
          .select('id')
          .eq('profile_id', (await supabase.from('profiles').select('id').eq('name', m.name).single()).data?.id ?? '')
          .single()
        if (existing) memberIds.push(existing.id)
        continue
      }
      fail('auth 생성 실패', authErr.message)
      continue
    }

    const userId = authData.user.id
    await supabase.from('profiles').update({ phone: m.phone }).eq('id', userId)

    // 담당 트레이너 배정 (PT 회원은 첫 번째 트레이너)
    const assignedTrainerId = m.member_type === 'pt' && trainerIds[i % trainerIds.length]
      ? trainerIds[i % trainerIds.length]
      : null

    const { data: memberRow, error: memberErr } = await supabase
      .from('members')
      .insert({
        profile_id: userId,
        member_type: m.member_type,
        assigned_trainer_id: assignedTrainerId,
        join_date: new Date().toISOString().slice(0, 10),
        is_active: true,
      })
      .select('id')
      .single()

    if (memberErr) { fail('members 생성 실패', memberErr.message); continue }

    memberIds.push(memberRow.id)
    ok(`${m.name} 완료 (member_id: ${memberRow.id})`)
  }

  // 3. PT 패키지 + 결제 내역 생성 (PT 회원 2명)
  console.log('\n💳 PT 패키지 생성 중...')
  const ptMembers = MEMBERS.map((m, i) => ({ ...m, memberId: memberIds[i] }))
    .filter((m) => m.member_type === 'pt' && m.memberId)

  for (let i = 0; i < ptMembers.length; i++) {
    const m = ptMembers[i]
    const trainerId = trainerIds[i % trainerIds.length]
    if (!trainerId) continue

    const { data: pkg, error: pkgErr } = await supabase
      .from('pt_packages')
      .insert({
        member_id: m.memberId,
        trainer_id: trainerId,
        total_sessions: 10,
        remaining_sessions: 8,
        price: 800000,
        start_date: new Date().toISOString().slice(0, 10),
        status: 'active',
      })
      .select('id')
      .single()

    if (pkgErr) { fail('pt_packages 생성 실패', pkgErr.message); continue }

    // 결제 내역
    await supabase.from('payments').insert({
      member_id: m.memberId,
      pt_package_id: pkg.id,
      amount: 800000,
      payment_method: 'card',
      status: 'completed',
      description: 'PT 10회 패키지',
    })

    ok(`${m.name} 패키지 완료`)
  }

  console.log('\n✅ 시드 완료!\n')
  console.log('계정 정보:')
  console.log('  트레이너: trainer1@fitcenter.com / trainer1234')
  console.log('  트레이너: trainer2@fitcenter.com / trainer1234')
  console.log('  트레이너: trainer3@fitcenter.com / trainer1234')
  console.log('  회원:     member1@test.com / member1234')
  console.log('  회원:     member2@test.com / member1234')
  console.log('  회원:     member3@test.com / member1234\n')
}

seed().catch((e) => {
  console.error('시드 실패:', e)
  process.exit(1)
})
