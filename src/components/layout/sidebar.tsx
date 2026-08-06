"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, UserRound, type LucideIcon } from "lucide-react";

// ── Navigation Config ──

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: UserRound },
];

// ── Props ──

type Props = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Mobile overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950",
          "transition-none", // no animation per requirements
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0", // always visible on desktop
        )}
      >
        {/* ── Logo ── */}
        <div className="flex h-14 items-center gap-3 border-b border-neutral-200 px-5 dark:border-neutral-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            E
          </div>
          <span className="text-lg font-semibold tracking-tight">
            English AI
          </span>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href !== "#" && pathname.startsWith(item.href);
            const isPlaceholder = item.href === "#";

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (isPlaceholder) e.preventDefault();
                  if (!isPlaceholder) onClose();
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                  isActive &&
                    "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                  isPlaceholder &&
                    "cursor-default text-neutral-400 dark:text-neutral-600",
                  !isActive &&
                    !isPlaceholder &&
                    "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                {isPlaceholder && (
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-neutral-300 dark:text-neutral-700">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            AI English Learning Platform
          </p>
        </div>
      </aside>
    </>
  );
}
