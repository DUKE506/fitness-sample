'use client'

import { useState } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { Header } from './header'
import type { Profile } from '@/lib/types'

interface AdminLayoutShellProps {
  profile: Profile
  children: React.ReactNode
}

export function AdminLayoutShell({ profile, children }: AdminLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-full">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          profile={profile}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
