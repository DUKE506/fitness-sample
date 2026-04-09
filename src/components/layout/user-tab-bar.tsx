'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const TAB_ITEMS = [
  { href: '/trainers', icon: Users, label: '트레이너' },
  { href: '/my-schedule', icon: Calendar, label: '내 스케줄' },
  { href: '/profile', icon: User, label: '프로필' },
]

export function UserTabBar() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-sm bg-neutral-900/80 backdrop-blur-[20px] border border-white/12 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <ul className="flex h-16">
          {TAB_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href)
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={cn(
                    'flex flex-col items-center justify-center h-full gap-1 text-xs font-medium transition-colors duration-200 rounded-2xl',
                    active ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  <Icon
                    className={cn('w-5 h-5', active ? 'text-emerald-400' : 'text-slate-500')}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
