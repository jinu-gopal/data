"use client";

import { type ReactNode } from "react";
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
  return (
    <div className="min-h-screen bg-[var(--max-background)] text-[var(--max-text)]">

      <MaxSidebar />

      <div className="min-h-screen lg:pl-[258px]">

        <MaxTopbar
          name={name}
          email={email}
          onSignOut={onSignOut}
        />

        <main className="min-h-[calc(100vh-76px)] bg-[var(--max-background)]">

          <div className="mx-auto w-full max-w-[1800px] px-5 py-6 sm:px-7 lg:px-8 xl:px-10">
            {children}
          </div>

        </main>
      </div>
    </div>
  );
}