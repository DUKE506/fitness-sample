import { differenceInCalendarDays } from 'date-fns'
import { cn } from '@/lib/utils/cn'

interface DDayBadgeProps {
  targetDate: string // "YYYY-MM-DD"
  className?: string
}

function DDayBadge({ targetDate, className }: DDayBadgeProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)

  const diff = differenceInCalendarDays(target, today)

  let label: string
  let colorClass: string

  if (diff === 0) {
    label = 'D-Day'
    colorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  } else if (diff > 0) {
    label = `D-${diff}`
    colorClass =
      diff <= 3
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        : 'bg-white/[0.08] text-slate-300 border-white/[0.12]'
  } else {
    label = `D+${Math.abs(diff)}`
    colorClass = 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  )
}

export { DDayBadge }
