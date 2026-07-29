"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type Props = {
  children: ReactNode;
};

export function AppLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* ── Sidebar ── */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col lg:ml-64">
        {/* ── Topbar ── */}
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />

        {/* ── Page content ── */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
