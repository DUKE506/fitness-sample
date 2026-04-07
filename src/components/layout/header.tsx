'use client'

import { Menu, LogOut } from 'lucide-react'
import { signOut } from '@/actions/auth'
import type { Profile } from '@/lib/types'

interface HeaderProps {
  profile: Profile
  onMenuClick: () => void
}

const ROLE_LABEL: Record<string, string> = {
  admin: '관리자',
  trainer: '트레이너',
  member: '회원',
}

export function Header({ profile, onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-[15px]">
      {/* 좌측: 모바일 햄버거 */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        aria-label="메뉴 열기"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 우측: 유저 정보 + 로그아웃 */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="text-right">
          <p className="text-sm font-medium text-white leading-tight">{profile.name}</p>
          <p className="text-xs text-slate-400 leading-tight mt-0.5">
            {ROLE_LABEL[profile.role] ?? profile.role}
          </p>
        </div>
        <div className="w-px h-6 bg-white/[0.12]" />
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">로그아웃</span>
          </button>
        </form>
      </div>
    </header>
  )
}
