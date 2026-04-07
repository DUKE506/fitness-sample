'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

interface SpecialtyFilterProps {
  specialties: string[]
  current: string | null
}

export function SpecialtyFilter({ specialties, current }: SpecialtyFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSelect = (specialty: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (specialty) {
      params.set('specialty', specialty)
    } else {
      params.delete('specialty')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const items = [{ label: '전체', value: null }, ...specialties.map((s) => ({ label: s, value: s }))]

  return (
    <div className="flex gap-2 flex-wrap">
      {items.map(({ label, value }) => {
        const active = current === value
        return (
          <button
            key={label}
            onClick={() => handleSelect(value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer',
              active
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-white/[0.08] text-slate-400 border-white/[0.12] hover:bg-white/[0.13] hover:text-white'
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
