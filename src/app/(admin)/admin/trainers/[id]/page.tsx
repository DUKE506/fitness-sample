import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Calendar, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TrainerForm } from "@/components/forms/trainer-form";
import { Badge } from "@/components/ui/badge";
import { ToggleActiveButton } from "./_components/toggle-active-button";
import type {
  TrainerWithProfile,
  MemberWithProfile,
  TrainerSchedule,
  TrainerDayOff,
} from "@/lib/types";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("trainers")
    .select("profiles(name)")
    .eq("id", id)
    .single();

  const name = (data?.profiles as { name: string } | null)?.name ?? "트레이너";
  return { title: `${name} — 트레이너 상세` };
}

export default async function TrainerDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [trainerRes, membersRes, schedulesRes, dayOffsRes] = await Promise.all([
    supabase.from("trainers").select("*, profiles(*)").eq("id", id).single(),
    supabase
      .from("members")
      .select("*, profiles(*), trainers(*)")
      .eq("assigned_trainer_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("trainer_schedules")
      .select("*")
      .eq("trainer_id", id)
      .eq("is_active", true)
      .order("day_of_week"),
    supabase
      .from("trainer_day_offs")
      .select("*")
      .eq("trainer_id", id)
      .gte("off_date", new Date().toISOString().slice(0, 10))
      .order("off_date")
      .limit(3),
  ]);

  if (trainerRes.error || !trainerRes.data) {
    notFound();
  }

  const trainer = trainerRes.data as TrainerWithProfile;
  const members = (membersRes.data ?? []) as MemberWithProfile[];
  const schedules = (schedulesRes.data ?? []) as TrainerSchedule[];
  const upcomingDayOffs = (dayOffsRes.data ?? []) as TrainerDayOff[];

  return (
    <div className="p-6 lg:p-8 w-full lg:max-w-3xl">
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          href="/admin/trainers"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          트레이너 목록
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">
            {trainer.profiles.name}
          </h1>
          <Badge variant={trainer.is_active ? "success" : "muted"}>
            {trainer.is_active ? "활성" : "비활성"}
          </Badge>
        </div>
        <p className="mt-1 text-slate-400 text-sm">
          {trainer.profiles.phone ?? "연락처 미등록"}
        </p>
      </div>

      {/* 수정 폼 */}
      <TrainerForm trainer={trainer} />

      {/* 활성화 토글 */}
      <div className="mt-8 rounded-2xl border border-white/12 bg-white/4 p-6">
        <h2 className="text-base font-semibold text-white mb-1">
          {trainer.is_active ? "트레이너 비활성화" : "트레이너 활성화"}
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          {trainer.is_active
            ? "비활성화하면 해당 트레이너는 회원 앱에 노출되지 않으며 신규 PT 신청을 받을 수 없습니다."
            : "활성화하면 해당 트레이너가 회원 앱에 다시 노출되어 PT 신청을 받을 수 있습니다."}
        </p>
        <ToggleActiveButton
          trainerId={trainer.id}
          isActive={trainer.is_active ?? false}
        />
      </div>

      {/* 스케줄 요약 카드 */}
      <div className="mt-8 rounded-2xl border border-white/12 bg-white/4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            스케줄
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/trainers/${trainer.id}/reservations`}
              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              예약 관리
            </Link>
            <Link
              href={`/admin/trainers/${trainer.id}/schedule`}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              설정 →
            </Link>
          </div>
        </div>

        {/* 근무 요일 */}
        {schedules.length === 0 ? (
          <p className="text-sm text-slate-500">근무시간이 설정되지 않았습니다.</p>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {DAY_LABELS.map((label, dow) => {
                const s = schedules.find((r) => r.day_of_week === dow);
                return (
                  <span
                    key={dow}
                    className={
                      s
                        ? "px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "px-2.5 py-1 rounded-full text-xs font-semibold bg-white/4 text-slate-600"
                    }
                  >
                    {label}
                  </span>
                );
              })}
            </div>
            <div className="space-y-1">
              {schedules.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 w-6">{DAY_LABELS[s.day_of_week]}</span>
                  <span className="text-white flex-1 ml-3">
                    {s.start_time.slice(0, 5)} ~ {s.end_time.slice(0, 5)}
                  </span>
                  <span className="text-slate-500 text-xs">{s.slot_duration_minutes}분 단위</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 예정 휴무일 */}
        {upcomingDayOffs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/8">
            <p className="text-xs text-slate-500 mb-2">예정 휴무일</p>
            <div className="flex flex-wrap gap-2">
              {upcomingDayOffs.map((d) => (
                <span
                  key={d.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20"
                >
                  {d.off_date}
                  {d.reason && <span className="text-red-500/70">· {d.reason}</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 담당 회원 목록 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          담당 회원
          <span className="ml-2 text-sm font-normal text-slate-400">
            {members.length}명
          </span>
        </h2>

        <div className="rounded-2xl border border-white/12 bg-white/4 overflow-hidden">
          {members.length === 0 ? (
            <p className="px-6 py-10 text-center text-slate-500 text-sm">
              담당 회원이 없습니다.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-6 py-3 text-slate-400 font-medium">
                    이름
                  </th>
                  <th className="text-left px-6 py-3 text-slate-400 font-medium hidden md:table-cell">
                    연락처
                  </th>
                  <th className="text-left px-6 py-3 text-slate-400 font-medium">
                    회원유형
                  </th>
                  <th className="text-left px-6 py-3 text-slate-400 font-medium hidden sm:table-cell">
                    상태
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-white/6 last:border-0 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <p className="text-white font-medium">
                        {member.profiles.name}
                      </p>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell text-slate-300">
                      {member.profiles.phone ?? "-"}
                    </td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={
                          member.member_type === "pt" ? "primary" : "default"
                        }
                      >
                        {member.member_type === "pt" ? "PT" : "일반"}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 hidden sm:table-cell">
                      <Badge variant={member.is_active ? "success" : "muted"}>
                        {member.is_active ? "활성" : "비활성"}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        href={`/admin/members/${member.id}`}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        상세 →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
