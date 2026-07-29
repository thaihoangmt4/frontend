"use client";

import { Menu } from "lucide-react";
import { Breadcrumb } from "./breadcrumb";
import { UserAvatar } from "./user-avatar";

type Props = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80 lg:px-6">
      {/* ── Left: hamburger + breadcrumb ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Breadcrumb />
      </div>

      {/* ── Right: user avatar ── */}
      <div className="flex items-center gap-3">
        <UserAvatar />
      </div>
    </header>
  );
}
