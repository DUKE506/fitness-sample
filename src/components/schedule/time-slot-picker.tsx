'use client'

import { cn } from '@/lib/utils/cn'
import type { AvailableSlot } from '@/lib/types'

interface TimeSlotPickerProps {
  slots: AvailableSlot[]
  selectedSlot: string | null
  onSelect: (slot: string) => void
  loading?: boolean
}

function formatSlotTime(timeStr: string): string {
  const parts = timeStr.split(':')
  const hour = parseInt(parts[0])
  const min = parts[1]
  const ampm = hour < 12 ? '오전' : '오후'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${ampm} ${displayHour}:${min}`
}

export function TimeSlotPicker({ slots, selectedSlot, onSelect, loading }: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-6">
        선택한 날짜에 가능한 시간이 없습니다.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((slot) => {
        const isSelected = selectedSlot === slot.start_time
        return (
          <button
            key={slot.start_time}
            onClick={() => onSelect(slot.start_time)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150',
              isSelected
                ? 'bg-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.4)]'
                : 'bg-white/[0.08] border border-white/[0.12] text-slate-300 hover:bg-white/[0.13] hover:text-white',
            )}
          >
            {formatSlotTime(slot.start_time)}
          </button>
        )
      })}
    </div>
  )
}
