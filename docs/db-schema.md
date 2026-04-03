# 데이터베이스 스키마 상세

> Supabase (PostgreSQL) 기반. 구현 시 이 문서를 참조하여 테이블 생성 및 RLS 정책 적용.

---

## ERD 개요

```
profiles (1) ──── (1) trainers
    │                    │
    │                    ├── trainer_schedules (1:N)
    │                    ├── trainer_day_offs (1:N)
    │                    │
profiles (1) ──── (1) members
                         │
                         ├── pt_packages (1:N) ── trainer (N:1)
                         ├── reservations (1:N) ── trainer (N:1)
                         └── payments (1:N)
```

---

## 테이블 SQL

### profiles

사용자 공통 프로필. `auth.users`와 1:1 매핑.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'trainer', 'member')),
  name text not null,
  phone text,
  avatar_url text,
  kakao_id text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | auth.users.id 참조 |
| role | text | 'admin' / 'trainer' / 'member' |
| name | text | 이름 |
| phone | text | 연락처 |
| avatar_url | text | 프로필 이미지 |
| kakao_id | text (unique) | 카카오 고유 ID |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

---

### trainers

트레이너 상세 정보.

```sql
create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  bio text,
  specialties text[] not null default '{}',
  career_years integer default 0,
  certifications text[] default '{}',
  profile_image_url text,
  is_active boolean default true,
  hourly_rate integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| profile_id | uuid (FK → profiles, unique) | 프로필 연결 |
| bio | text | 소개글 |
| specialties | text[] | 전문 분야 배열 |
| career_years | integer | 경력 연수 |
| certifications | text[] | 자격증 배열 |
| profile_image_url | text | 프로필 사진 |
| is_active | boolean | 활성 여부 |
| hourly_rate | integer | 시간당 요금 (원) |

---

### members

회원 정보.

```sql
create table public.members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  member_type text not null default 'general' check (member_type in ('general', 'pt')),
  assigned_trainer_id uuid references public.trainers(id),
  join_date date default current_date,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| profile_id | uuid (FK → profiles, unique) | 프로필 연결 |
| member_type | text | 'general' / 'pt' |
| assigned_trainer_id | uuid (FK → trainers) | 담당 트레이너 |
| join_date | date | 가입일 |
| is_active | boolean | 활성 여부 |

---

### pt_packages

PT 패키지 (구매 단위). admin이 회원 상세에서 등록/결제 처리.

```sql
create table public.pt_packages (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  trainer_id uuid not null references public.trainers(id),
  total_sessions integer not null,
  remaining_sessions integer not null,
  price integer not null,
  start_date date not null,
  end_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled', 'expired')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| member_id | uuid (FK → members) | 회원 |
| trainer_id | uuid (FK → trainers) | 트레이너 |
| total_sessions | integer | 총 세션 수 |
| remaining_sessions | integer | 잔여 세션 수 |
| price | integer | 결제 금액 (원) |
| start_date | date | 시작일 |
| end_date | date | 만료일 |
| status | text | 'active' / 'completed' / 'cancelled' / 'expired' |

---

### trainer_schedules

트레이너 근무 시간 설정.

```sql
create table public.trainer_schedules (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_duration_minutes integer not null default 60,
  max_slots_per_hour integer not null default 1,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(trainer_id, day_of_week)
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| trainer_id | uuid (FK → trainers) | 트레이너 |
| day_of_week | integer (0~6) | 요일 (0=일, 6=토) |
| start_time | time | 근무 시작 |
| end_time | time | 근무 종료 |
| slot_duration_minutes | integer | 슬롯 단위 (기본 60분) |
| max_slots_per_hour | integer | 시간당 최대 예약 수 |
| is_active | boolean | 활성 여부 |
| UNIQUE(trainer_id, day_of_week) | | 요일당 1개 설정 |

---

### trainer_day_offs

트레이너 휴무일.

```sql
create table public.trainer_day_offs (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  off_date date not null,
  reason text,
  created_at timestamptz default now(),
  unique(trainer_id, off_date)
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| trainer_id | uuid (FK → trainers) | 트레이너 |
| off_date | date | 휴무 날짜 |
| reason | text | 사유 |
| UNIQUE(trainer_id, off_date) | | 날짜당 1개 |

---

### reservations

예약. 회원이 신청(pending) → 트레이너가 승인(confirmed)/거부(rejected).

```sql
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id),
  trainer_id uuid not null references public.trainers(id),
  pt_package_id uuid references public.pt_packages(id),
  reservation_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'no_show')),
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| member_id | uuid (FK → members) | 회원 |
| trainer_id | uuid (FK → trainers) | 트레이너 |
| pt_package_id | uuid (FK → pt_packages) | PT 패키지 |
| reservation_date | date | 예약 날짜 |
| start_time | time | 시작 시간 |
| end_time | time | 종료 시간 |
| status | text | 'pending' / 'confirmed' / 'rejected' / 'cancelled' / 'completed' / 'no_show' |
| cancelled_at | timestamptz | 취소 일시 |
| cancel_reason | text | 취소 사유 |

**상태 플로우**: `pending` → `confirmed` (트레이너 승인) / `rejected` (거부) → `completed` (완료) / `cancelled` (취소) / `no_show` (노쇼)

---

### payments

결제 내역. admin이 회원 상세에서 PT 패키지 등록 시 생성.

```sql
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id),
  pt_package_id uuid references public.pt_packages(id),
  amount integer not null,
  payment_method text default 'card' check (payment_method in ('card', 'cash', 'transfer')),
  payment_date timestamptz default now(),
  status text not null default 'completed' check (status in ('completed', 'refunded', 'pending')),
  description text,
  created_at timestamptz default now()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| member_id | uuid (FK → members) | 회원 |
| pt_package_id | uuid (FK → pt_packages) | PT 패키지 |
| amount | integer | 결제 금액 (원) |
| payment_method | text | 'card' / 'cash' / 'transfer' |
| payment_date | timestamptz | 결제일 |
| status | text | 'completed' / 'refunded' / 'pending' |
| description | text | 설명 |

---

## RLS (Row Level Security) 정책

| 테이블 | admin | trainer | member |
|--------|-------|---------|--------|
| profiles | 전체 CRUD | 본인 읽기/수정 | 본인 읽기/수정 |
| trainers | 전체 CRUD | 본인 읽기/수정 | 전체 읽기 |
| members | 전체 CRUD | 담당 회원 읽기 | 본인 읽기 |
| pt_packages | 전체 CRUD | 담당 건 읽기 | 본인 읽기 |
| trainer_schedules | 전체 CRUD | 본인 읽기/수정 | 전체 읽기 |
| trainer_day_offs | 전체 CRUD | 본인 CRUD | 전체 읽기 |
| reservations | 전체 CRUD | 담당 건 읽기/수정 | 본인 생성/읽기/취소 |
| payments | 전체 CRUD | 읽기 불가 | 본인 읽기 |

### RLS 정책 SQL 예시

```sql
-- profiles RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin full access to profiles"
  on public.profiles for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- trainers RLS (공개 읽기)
alter table public.trainers enable row level security;

create policy "Public read trainers"
  on public.trainers for select
  using (true);

create policy "Admin manage trainers"
  on public.trainers for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- reservations RLS
alter table public.reservations enable row level security;

create policy "Members view own reservations"
  on public.reservations for select
  using (
    member_id in (select id from public.members where profile_id = auth.uid())
  );

create policy "Trainers view assigned reservations"
  on public.reservations for select
  using (
    trainer_id in (select id from public.trainers where profile_id = auth.uid())
  );

create policy "Members create reservations"
  on public.reservations for insert
  with check (
    member_id in (select id from public.members where profile_id = auth.uid())
  );

create policy "Trainers can approve/reject reservations"
  on public.reservations for update
  using (
    trainer_id in (select id from public.trainers where profile_id = auth.uid())
  );

create policy "Admin full access to reservations"
  on public.reservations for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
```

---

## Database Functions (RPC)

### get_available_slots

트레이너의 특정 날짜 예약 가능 시간 반환.

```sql
create or replace function get_available_slots(p_trainer_id uuid, p_date date)
returns table(start_time time, end_time time)
language plpgsql as $$
declare
  v_day_of_week integer;
begin
  v_day_of_week := extract(dow from p_date)::integer;

  -- 휴무일 체크
  if exists (
    select 1 from trainer_day_offs
    where trainer_id = p_trainer_id and off_date = p_date
  ) then
    return;
  end if;

  -- 근무 시간에서 이미 예약된 슬롯 제외
  return query
  with schedule as (
    select ts.start_time as s_start, ts.end_time as s_end, ts.slot_duration_minutes
    from trainer_schedules ts
    where ts.trainer_id = p_trainer_id
      and ts.day_of_week = v_day_of_week
      and ts.is_active = true
  ),
  slots as (
    select
      (s_start + (n * (slot_duration_minutes || ' minutes')::interval))::time as slot_start,
      (s_start + ((n + 1) * (slot_duration_minutes || ' minutes')::interval))::time as slot_end
    from schedule,
    generate_series(0, extract(epoch from (s_end - s_start))::integer / (slot_duration_minutes * 60) - 1) as n
  ),
  booked as (
    select r.start_time, r.end_time
    from reservations r
    where r.trainer_id = p_trainer_id
      and r.reservation_date = p_date
      and r.status in ('pending', 'confirmed')
  )
  select s.slot_start, s.slot_end
  from slots s
  where not exists (
    select 1 from booked b
    where s.slot_start < b.end_time and s.slot_end > b.start_time
  )
  order by s.slot_start;
end;
$$;
```

### create_reservation_with_session_decrement

예약 생성 + 잔여 세션 차감 (트랜잭션).

```sql
create or replace function create_reservation_with_session_decrement(
  p_member_id uuid,
  p_trainer_id uuid,
  p_pt_package_id uuid,
  p_date date,
  p_start_time time,
  p_end_time time
)
returns uuid
language plpgsql as $$
declare
  v_reservation_id uuid;
  v_remaining integer;
begin
  -- 잔여 세션 확인
  select remaining_sessions into v_remaining
  from pt_packages
  where id = p_pt_package_id and status = 'active'
  for update;

  if v_remaining is null or v_remaining <= 0 then
    raise exception 'No remaining sessions';
  end if;

  -- 예약 생성
  insert into reservations (member_id, trainer_id, pt_package_id, reservation_date, start_time, end_time, status)
  values (p_member_id, p_trainer_id, p_pt_package_id, p_date, p_start_time, p_end_time, 'pending')
  returning id into v_reservation_id;

  -- 잔여 세션 차감
  update pt_packages
  set remaining_sessions = remaining_sessions - 1,
      updated_at = now()
  where id = p_pt_package_id;

  return v_reservation_id;
end;
$$;
```

### cancel_reservation_with_session_restore

예약 취소 + 잔여 세션 복구 (트랜잭션).

```sql
create or replace function cancel_reservation_with_session_restore(
  p_reservation_id uuid,
  p_cancel_reason text default null
)
returns void
language plpgsql as $$
declare
  v_package_id uuid;
begin
  -- 예약 취소 처리
  update reservations
  set status = 'cancelled',
      cancelled_at = now(),
      cancel_reason = p_cancel_reason,
      updated_at = now()
  where id = p_reservation_id
    and status in ('pending', 'confirmed')
  returning pt_package_id into v_package_id;

  if v_package_id is not null then
    -- 잔여 세션 복구
    update pt_packages
    set remaining_sessions = remaining_sessions + 1,
        updated_at = now()
    where id = v_package_id;
  end if;
end;
$$;
```

### get_monthly_revenue

월별 매출 집계.

```sql
create or replace function get_monthly_revenue(p_year integer, p_month integer)
returns table(total_amount bigint, payment_count bigint)
language plpgsql as $$
begin
  return query
  select
    coalesce(sum(amount), 0)::bigint as total_amount,
    count(*)::bigint as payment_count
  from payments
  where extract(year from payment_date) = p_year
    and extract(month from payment_date) = p_month
    and status = 'completed';
end;
$$;
```

### get_trainer_revenue

트레이너별 매출 집계.

```sql
create or replace function get_trainer_revenue(p_trainer_id uuid, p_year integer, p_month integer)
returns table(total_amount bigint, payment_count bigint)
language plpgsql as $$
begin
  return query
  select
    coalesce(sum(p.amount), 0)::bigint as total_amount,
    count(*)::bigint as payment_count
  from payments p
  join pt_packages pkg on p.pt_package_id = pkg.id
  where pkg.trainer_id = p_trainer_id
    and extract(year from p.payment_date) = p_year
    and extract(month from p.payment_date) = p_month
    and p.status = 'completed';
end;
$$;
```

---

## DB Trigger: 회원가입 시 profiles 자동 생성

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, role, avatar_url, kakao_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', 'Unknown'),
    'member',
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'provider_id'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## DB Seed: admin 기본 계정

서버 최초 실행 시 admin 계정 자동 생성 (id: `admin`, pw: `admin`).

```sql
-- Supabase Auth로 admin 계정 생성 후 profiles에 role='admin' 설정
-- 실제 구현은 Supabase Admin API 또는 seed 스크립트로 처리
```
