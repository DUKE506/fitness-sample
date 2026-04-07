'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  BarChart2,
  Dumbbell,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: '대시보드', exact: true },
  { href: '/admin/trainers', icon: Users, label: '트레이너 관리' },
  { href: '/admin/members', icon: UserCheck, label: '회원 관리' },
  { href: '/admin/schedule', icon: Calendar, label: '전체 스케줄' },
  { href: '/admin/revenue', icon: BarChart2, label: '매출 관리' },
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const nav = (
    <div className="flex flex-col h-full">
      {/* 로고 */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.08]">
        <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
          <Dumbbell className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">FitCenter</span>
      </div>

      {/* 내비게이션 */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border',
                active
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'text-slate-400 hover:bg-white/[0.08] hover:text-white border-transparent'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* 데스크탑 사이드바 */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full border-r border-white/[0.12] bg-white/[0.04] backdrop-blur-[15px]">
        {nav}
      </aside>

      {/* 모바일 드로어 */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="relative z-10 w-72 flex flex-col h-full bg-[#111111] border-r border-white/[0.12]">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              aria-label="메뉴 닫기"
            >
              <X className="w-5 h-5" />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  )
}
