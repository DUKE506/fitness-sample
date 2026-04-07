import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ScheduleForm } from "@/components/forms/schedule-form";
import type { TrainerSchedule, TrainerDayOff } from "@/lib/types";

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
  return { title: `${name} — 스케줄 설정` };
}

export default async function TrainerSchedulePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [trainerRes, schedulesRes, dayOffsRes] = await Promise.all([
    supabase
      .from("trainers")
      .select("id, profiles(name)")
      .eq("id", id)
      .single(),
    supabase
      .from("trainer_schedules")
      .select("*")
      .eq("trainer_id", id)
      .order("day_of_week"),
    supabase
      .from("trainer_day_offs")
      .select("*")
      .eq("trainer_id", id)
      .order("off_date"),
  ]);

  if (trainerRes.error || !trainerRes.data) {
    notFound();
  }

  const trainerName =
    (trainerRes.data.profiles as { name: string } | null)?.name ?? "트레이너";
  const schedules = (schedulesRes.data ?? []) as TrainerSchedule[];
  const dayOffs = (dayOffsRes.data ?? []) as TrainerDayOff[];

  return (
    <div className="p-6 lg:p-8 w-full lg:max-w-2xl">
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          href={`/admin/trainers/${id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          {trainerName} 상세
        </Link>
        <h1 className="text-3xl font-bold text-white">스케줄 설정</h1>
        <p className="mt-1 text-slate-400 text-sm">
          요일별 근무시간과 휴무일을 관리합니다.
        </p>
      </div>

      <ScheduleForm
        trainerId={id}
        schedules={schedules}
        dayOffs={dayOffs}
      />
    </div>
  );
}
