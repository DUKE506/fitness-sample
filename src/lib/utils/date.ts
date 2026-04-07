import {
  format,
  formatDistanceToNow,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  isPast,
  isFuture,
  parseISO,
} from "date-fns";
import { ko } from "date-fns/locale";

export {
  format,
  formatDistanceToNow,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  isPast,
  isFuture,
  parseISO,
};

/** "2024년 1월 15일 (월)" 형식 */
export function formatKoreanDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy년 M월 d일 (eee)", { locale: ko });
}

/** "오전 9:00" / "오후 2:30" 형식 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "a h:mm", { locale: ko });
}

/** "yyyy-MM-dd" ISO 날짜 문자열 */
export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** D-day 계산: 오늘이면 "D-Day", 이후면 "D-N", 지났으면 null */
export function getDday(date: Date | string): string | null {
  const d = typeof date === "string" ? parseISO(date) : date;
  const diff = differenceInDays(d, new Date());
  if (diff === 0) return "D-Day";
  if (diff > 0) return `D-${diff}`;
  return null;
}
