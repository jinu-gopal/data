"use client";

import { ReactNode, useState } from "react";
import RecruitingSidebar from "./RecruitingSidebar";
import RecruitingHeader from "./RecruitingHeader";
import MaxAiFloatingPanel from "./MaxAiFloatingPanel";

interface RecruitingShellProps {
  children: ReactNode;
  onSearch?: (q: string) => void;
  onRequestCreateModal?: () => void;
}

export default function RecruitingShell({
  children,
  onSearch,
  onRequestCreateModal,
}: RecruitingShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-row font-sans antialiased">
      {/* 1. Left Dark Navy Sidebar */}
      <RecruitingSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((p) => !p)}
        onRequestCreateModal={onRequestCreateModal}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <RecruitingHeader onSearch={onSearch} />

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1720px] w-full mx-auto">
          {children}
        </main>

        {/* 3. Approved MAX AI Floating Panel (Image 1 Approved Design) */}
        <MaxAiFloatingPanel />
      </div>
    </div>
  );
}
