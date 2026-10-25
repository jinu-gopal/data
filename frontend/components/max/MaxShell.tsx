"use client";

import { type ReactNode, useState } from "react";
import MaxSidebar from "./MaxSidebar";
import MaxTopbar from "./MaxTopbar";

type MaxShellProps = {
  children: ReactNode;
  name?: string;
  email?: string | null;
  onSignOut?: () => void;
};

export default function MaxShell({
  children,
  name,
  email,
  onSignOut,
}: MaxShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans antialiased">
      {/* 1. FULL-WIDTH DELOITTE/AWS EXECUTIVE TOPBAR (100% SCREEN WIDTH) */}
      <MaxTopbar
        name={name}
        email={email}
        onSignOut={onSignOut}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 w-full">
        {/* Optional Collapsible Sidebar / Drawer */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="min-h-[calc(100vh-64px)] w-full bg-[#f8fafc]">
          <div className="mx-auto w-full max-w-[1720px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}