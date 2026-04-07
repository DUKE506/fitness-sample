"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs 컴포넌트 내에서만 사용 가능합니다");
  return ctx;
}

interface TabsProps {
  defaultTab: string;
  children: React.ReactNode;
  className?: string;
}

function Tabs({ defaultTab, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("flex flex-col", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-1 bg-white/[0.06] border border-white/[0.12] rounded-xl p-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function Tab({ value, className, children, ...props }: TabProps) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        "flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 cursor-pointer",
        isActive
          ? "bg-emerald-500 text-white"
          : "text-slate-400 hover:text-white hover:bg-white/[0.08]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabPanel({ value, className, children, ...props }: TabPanelProps) {
  const { activeTab } = useTabs();
  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className={cn("mt-4", className)} {...props}>
      {children}
    </div>
  );
}

export { Tabs, TabList, Tab, TabPanel };
