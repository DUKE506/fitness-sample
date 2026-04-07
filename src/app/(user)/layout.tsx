import { UserTabBar } from '@/components/layout/user-tab-bar'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 min-h-0 overflow-y-auto pb-24">{children}</main>
      <UserTabBar />
    </div>
  )
}
